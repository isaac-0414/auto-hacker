from openai import OpenAI
import os
import re
from time import time, sleep
from .file_io import save_file 

def gpt(system_msg: str, user_msg: str, model="gpt-4", temp=0.0, top_p=1.0, tokens=1024, freq_pen=0.0, pres_pen=0.0, log=True):
    max_retry = 3
    retry = 0
    
    system_msg = system_msg.strip()
    user_msg = user_msg.strip()

    client = OpenAI()

    while True:
        try:
            completion = client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": system_msg},
                    {"role": "user", "content": user_msg}
                ],
                temperature=temp,
                max_tokens=tokens,
                top_p=top_p,
                frequency_penalty=freq_pen,
                presence_penalty=pres_pen
            )
            text = completion.choices[0].message.content
            text = text.strip()
    
            filename = '%s_gpt.txt' % time()
            if not os.path.exists('gpt_logs'):
                os.makedirs('gpt_logs')
            if log:
                save_file('gpt_logs/%s' % filename, system_msg + '\n\n==========\n\n' + user_msg + '\n\n==========\n\n' + text)
            
            return text
        except Exception as oops:
            retry += 1
            if retry >= max_retry:
                return "GPT error: %s" % oops
            print('Error communicating with OpenAI:', oops)
            sleep(1)