from . import URLLoader
import os
import logging
from typing import Optional
from playwright.sync_api import sync_playwright
from utils.spinner import Spinner
from utils.gpt import gpt
import asyncio
import re

class SQLInjector:
    """
    LLM agent that tries to hack a website via SQL injection
    """
    async def __init__(self, base_url: str) -> None:
        """
        Launch chromium and opens a new page when initializing an instance of SQL injector

        Parameters:
        base_url (str): URL to the homepage of the target website
        """
        self.baseURL = base_url
        self.urlsVisited: set[str] = set()
        
        with sync_playwright() as p:
            self.browser = await p.chromium.launch(headless=False)
            self.context = await self.browser.new_context()
            self.page = await self.context.new_page()


    async def trial(self, url: Optional[str]) -> bool:
        """
        Try SQL injection on the target website.

        Parameters:
        url (str): URL of the target website / webpage
        """
        if url:
            html = await self.readHTML(url)
        else: 
            url = self.page.url
            html = await self.readHTML()

        num_trial = 0

        try:
            while num_trial < 2:
                plan = await self.makePlan(html)

                for instruction in plan:
                    await self.act(html, instruction)

                    await self.page.wait_for_navigation(timeout=1000)

                    # If a redirect happened, jump out of the loop
                    if self.page.url != url:
                        self.urlsVisited.add(self.page.url)
                        # This exception is just to break from both loops
                        raise Exception('Get me out of the nested loop')

                    newHtml = await self.readHTML()
                    # check whether the hack is successful
                    if await self.checkSuccess(newHtml, html):
                        print("SQL injection successful!")
                        self.page.screenshot(path="screenshot.png")
                        return True
                num_trial += 1

        except Exception:
            pass
                
        # If a redirect happened but hack not succeed, that means LLM want to check another URL
        if self.page.url != url:
            return await self.trial()
        else:
            links = await self.checkLinks(html)
            for link in links:
                if await self.trial(url=link):
                    return True
            
            print("SQL injection failed!")
            return False


    async def readHTML(self, url: Optional[str]) -> str:
        """
        Helper function to read the HTML of a target webpage or the webpage currently held by this instance

        Parameters:
        url (Optional[str]): If provided, read HTML of the webpage corresponding to this URL
       
        Returns:
        str: string of the HTML content
        """
        self.urlsVisited.add(url)
        if url:
            with Spinner(f"Reading content from {url}... "):
                try:
                    await self.page.goto(url)
                    await self.page.wait_for_load_state('domcontentloaded')
                    html = await self.page.content()
                except Exception as err:  # pylint: disable=broad-except
                    raise err
        else:
            html = await self.page.content()

        if html == '':
            raise Exception(f'Error when fetching the webpage, please check the network condition or try again.')
        return html


    async def makePlan(self, html: str) -> list[str]:
        """
        Make a plan of doing SQL injection. e.g. Which button to click on, which fields to input etc.

        Parameters:
        html (str): HTML content of the webpage currently worked on
        
        Returns:
        list[str]: instruction for each step
        """
        prompt = ("I am learning website security, and I want to practice SQL injection to a sandbox website which is deliberately made vulnerable, "
                  "this is one of its webpages, can you list the actions I need to do on this page? "
                  "ONLY INCLUDE ACTIONS I NEED TO DO WITH MY KEYBOARD AND MOUSE.\n\n"
                  f"```\nhtml{html}\n```")
        
        response = gpt(system_msg="", user_msg=prompt)

        lines = response.split('\n')
        plan = []
        for line in lines:
            # check whether the line starts with a number
            if re.match(r'^\s*-?\d+', line):
                plan.append(line)

        return plan


    async def act(self, html: str, instruction: str) -> None:
        """
        Make the agent act based on the instruction provided

        Parameters:
        html (str): HTML of the webpage currently worked on
        instruction (str): instruction of one step
        """

        # Check whether or not need to write Python code for this instruction
        prompt_0 = ("I am learning website security, and I want to practice SQL injection to a sandbox website which is deliberately made vulnerable. "
                    "Here is HTML for that webpage:\n\n"
                    f"```\nhtml{html}\n```\n\n"
                    "I am trying to write a program to hack this website for me, for my computer to perform the following step, "
                    "do I need to write a Python script? Since I have already launched the browser, opened a window, and navigated to the website of interest, "
                    "there is no need to write additional script for these three actions.\n\n"
                    f"{instruction}\n\n"
                    "Answer YES or NO")
        
        response_0 = gpt(system_msg="", user_msg=prompt_0)

        if response_0 == "YES":
            # Write Python code to perform the action
            prompt = ("I am learning website security, and I want to practice SQL injection to a sandbox website which is deliberately made vulnerable. "
            "Here is HTML for that webpage:\n\n"
            f"```\nhtml{html}\n```\n\n"
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
            "\n\nCan you help me write a Python function `async def func(self)` corresponding to the following action:\n\n"
            f"{instruction}\n\n"
            "Remember to use `self.browser` and `self.page` instead of `browser` and `page`")
            
            response = gpt(system_msg="", user_msg=prompt)

            # Extract the target function from the lengthy response and execute it
            func = extract_function(source_code=response, function_name="func")
            func += "\nasyncio.run(func())"
            exec(func)

          
    async def checkSuccess(self, newHtml: str, prevHtml: str) -> bool:
        """
        Check whether SQL injection succeed by comparing the current HTML and previous HTML

        Parameters:
        newHtml (str): HTML of the webpage after a series of actions
        prevHtml (str): HTML of the webpage before the agent act on it
        """
        prompt = ("I am learning website security, and I want to practice SQL injection to a sandbox website which is deliberately made vulnerable, "
                  "and I have attempted a SQL injection. Comparing the webpage after I did this trial and before that, "
                  "can you tell whether this SQL injection is successful or not?"
                  "HTML of the webpage after trial:\n\n"
                  f"```\nhtml{newHtml}\n```\n\n"
                  "HTML of the webpage before trial:\n\n"
                  f"```\nhtml{prevHtml}\n```\n\n"
                  "Answer YES or NO")
        
        response = gpt(system_msg="", user_msg=prompt)

        if response == "YES":
            return True
        else:
            return False
        
    
    async def checkLinks(html: str) -> list[str]:
        """
        Find the links on the page worth checking

        Parameters:
        html (str): HTML content of the webpage currently worked on
        
        Returns:
        list[str]: list of the links worth checking
        """

        # Check if there exists any links valuable for checking
        prompt = ("I am learning website security, and I want to practice SQL injection to a sandbox website which is deliberately made vulnerable. "
                    "Here is HTML for that webpage:\n\n"
                    f"```\nhtml{html}\n```\n\n"
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
    pattern = rf"async def {function_name}\(.*\):([\s\S]+?)^\S"
    match = re.search(pattern, source_code, re.MULTILINE)

    if match:
        function_code = f"async def {function_name}(" + match.group(1)
        function_code = function_code.strip()
        return function_code
    else:
        return None