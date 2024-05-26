import openai
import os
from dotenv import load_dotenv
from agent.SQLInjector import SQLInjector
import asyncio

async def main():
    
    load_dotenv()
    OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')

    openai.api_key = OPENAI_API_KEY
    
    print("\nPlease enter a URL for me to hack")
    asyncio.sleep(0.5)
    url = input('\nURL: ')
    sql_injector = await SQLInjector(base_url=url)
    await sql_injector.trial(url)
        

if __name__ == '__main__':
    asyncio.run(main())