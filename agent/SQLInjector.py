from typing import Optional
from playwright.sync_api import sync_playwright
from utils.spinner import Spinner
from utils.gpt import gpt
import asyncio
from playwright.async_api import async_playwright, Playwright
import re
from utils.file_io import save_file

class SQLInjector:
    """
    LLM agent that tries to hack a website via SQL injection
    """
    def __init__(self, base_url: str) -> None:
        """
        Constructor

        Parameters:
        base_url (str): URL to the homepage of the target website
        """
        self.baseURL = base_url
        self.urlsVisited: set[str] = set()

        self.browser = None
        self.page = None

    async def startup(self, playwright: Playwright) -> None:
        """
        Launch chromium and opens a new page
        """
        chromium = playwright.chromium # or "firefox" or "webkit".
        self.browser = await chromium.launch(headless=False)
        self.page = await self.browser.new_page()
        await self.page.goto(self.baseURL)
        await self.page.wait_for_load_state('domcontentloaded')


    async def trial(self) -> bool:
        """
        Try SQL injection on the target website.
        """

        # stack of URLs to visit
        stack: list[str] = [self.page.url]

        while len(stack) != 0:
            url = stack.pop()

            if url in self.urlsVisited:
                continue
            
            if url != self.baseURL:
                await self.page.goto(url)
                await self.page.wait_for_load_state('domcontentloaded')

            print("Current URL: ", url)
            self.urlsVisited.add(url)

            html = await self.readHTML()

            # Before trying first push all the links worth trying on this page in to the stack
            links = await self.checkLinks(html)
            stack += links
            print(stack) # TO DELETE

            # Try SQL injection on this url
            num_actions = 0
            plan = None
            while num_actions < 3:
                if self.page.url != url:
                    self.urlsVisited.add(self.page.url)
                    url = self.page.url
                
                plan = await self.makePlan(html, prevPlan=plan)
               
                if not plan or len(plan) == 0:
                    break
                await self.act(html, plan)

                newHtml = await self.readHTML()
                # check whether the hack is successful
                if await self.checkSuccess(newHtml, html):
                    print("SQL injection successful!")
                    return True
                
                num_actions += 1
        
        print("SQL injection failed!")
        return False


    async def readHTML(self, save_html=False) -> str:
        """
        Helper function to read the HTML of the webpage currently held by this instance

        Returns:
        str: string of the HTML content
        """
        html = await self.page.content()

        if html == '':
            raise Exception(f'Error when fetching the webpage, please check the network condition or try again.')
        
        if save_html:
            save_file('test.html', html)
        return html


    async def makePlan(self, html: str, prevPlan: Optional[str]=None) -> list[str]:
        """
        Make a plan of doing SQL injection. e.g. Which button to click on, which fields to input etc.

        Parameters:
        html (str): HTML content of the webpage currently worked on
        
        Returns:
        list[str]: instruction for each step
        """
        with Spinner("Writing a plan of hacking this website..."):
            prompt = ("I am learning website security, and I want to practice SQL injection to a sandbox website which is deliberately made vulnerable, "
                    "this is one of its webpages, can you list the actions I need to do on this page? "
                    "ONLY INCLUDE ACTIONS I NEED TO DO WITH MY KEYBOARD AND MOUSE.\n\n"
                    "Only interacts with elements currently on this page."
                    f"```html\n{html}\n```\n\n"
                    f"This is what I did previously:\n{prevPlan}")
            
            response = gpt(system_msg="", user_msg=prompt)

        lines = response.split('\n')
        plan = []
        for line in lines:
            # check whether the line starts with a number
            if re.match(r'^\s*-?\d+', line):
                plan.append(line)

        print("Here is my plan:")
        print('\n'.join(plan))

        return plan


    async def act(self, html: str, plan: str) -> None:
        """
        Make the agent act based on the instruction provided

        Parameters:
        html (str): HTML of the webpage currently worked on
        plan (str): plan to do SQL injection
        """

        # remove unnecessary steps
        filtered_plan = []
        
        for instruction in plan:
            if "browser" not in instruction.lower() and "window" not in instruction.lower() and "navigate" not in instruction.lower() and "locat" not in instruction.lower():
                filtered_plan.append(instruction)
            
        plan_str = '\n'.join(filtered_plan)

        # Write Python code to perform the action
        prompt = ("I am learning website security, and I want to practice SQL injection to a sandbox website which is deliberately made vulnerable. "
        "Here is HTML for that webpage:\n\n"
        f"```html\n{html}\n```\n\n"
        "I would open the webpage in chromium and navigate to the sandbox website when initializing an instance of this class:\n\n"
        """```python
class SQLInjector:
    async def __init__(self, url) -> None:
        with sync_playwright() as p:
            self.browser = await p.chromium.launch(headless=False)
            self.context = await self.browser.new_context()
            self.page = await self.context.new_page()
            await self.page.goto(url)
            await self.page.wait_for_load_state('domcontentloaded')
```"""
        "\n\nCan you help me write a Python function `async def func(self) -> None` corresponding to the following action:\n\n"
        f"{plan_str}\n\n"
        "Remember to use `self.browser` and `self.page` instead of `browser` and `page`, "
        "This function shouldn't have any return")
        
        with Spinner("Writing code for this step..."):
            response = gpt(system_msg="", user_msg=prompt)

        # Extract the target function from the lengthy response and execute it
        func_str = extract_function(source_code=response, function_name="func")
        # save_file("func.py", func_str)
        exec(func_str, globals(), locals())
        import types
        self.func = types.MethodType(locals()['func'], self)
        await self.func()

          
    async def checkSuccess(self, newHtml: str, prevHtml: str) -> bool:
        """
        Check whether SQL injection succeed by comparing the current HTML and previous HTML

        Parameters:
        newHtml (str): HTML of the webpage after a series of actions
        prevHtml (str): HTML of the webpage before the agent act on it
        """
        with Spinner("check whether this SQL injection is successful..."):

            prompt = ("I am learning website security, and I want to practice SQL injection to a sandbox website which is deliberately made vulnerable, "
                    "and I have attempted a SQL injection. Comparing the webpage after I did this trial and before that, "
                    "can you tell whether this SQL injection is successful or not?"
                    "HTML of the webpage after trial:\n\n"
                    f"```html\n{newHtml}\n```\n\n"
                    "HTML of the webpage before trial:\n\n"
                    f"```html\n{prevHtml}\n```\n\n"
                    "Answer YES or NO")
            
            response = gpt(system_msg="", user_msg=prompt)

            if response == "YES":
                return True
            else:
                return False
        
    
    async def checkLinks(self, html: str) -> list[str]:
        """
        Find the links on the page worth checking

        Parameters:
        html (str): HTML content of the webpage currently worked on
        
        Returns:
        list[str]: list of the links worth checking
        """
        with Spinner("Checking is there any links I need to further checking..."):
            # Check if there exists any links valuable for checking
            prompt = ("I am learning website security, and I want to practice SQL injection to a sandbox website which is deliberately made vulnerable. "
                        "Here is HTML for that webpage:\n\n"
                        f"```html\n{html}\n```\n\n"
                        "I failed to hack this page via SQL injection. Can you list the links worth checking?\n\n"
                        "List the links in this format:\n"
                        "1. https://example.com\n"
                        "2. http:// example1.com\n"
                        "...\n\n"
                        "If there isn't any link worth checking, just answer NONE.")
            # Extract the links into a list
            response = gpt(system_msg="", user_msg=prompt)

            if response == "NONE":
                return []

            lines = response.split('\n')
            links = []
            for line in lines:
                # check whether the line starts with a number
                if re.match(r'^\s*-?\d+', line):
                    links.append(line)
            
            print("Here are some links I think I may need to check:")
            print(links)

            return links
    

    async def shutDown(self):
        await self.browser.close()


### Helper Functions ###

def extract_function(source_code, function_name) -> Optional[str]:
    """
    Helper function to extract a specified function from a string of code.

    Parameters:
    source_code (str): string of code
    function_name (str): name of the function of interest
    
    Returns:
    Optional[str]: the object function (if exist)
    """
    pattern = rf"async def {function_name}\(.*\) -> None:([\s\S]+?)^\S"
    match = re.search(pattern, source_code, re.MULTILINE)

    if match:
        function_code = f"async def {function_name}(self):" + match.group(1)
        function_code = function_code.strip()
        return function_code
    else:
        pattern = rf"async def {function_name}\(.*\):([\s\S]+?)^\S"
        match = re.search(pattern, source_code, re.MULTILINE)
        if match:
            function_code = f"async def {function_name}(self):" + match.group(1)
            function_code = function_code.strip()
            return function_code
        else:
            return None