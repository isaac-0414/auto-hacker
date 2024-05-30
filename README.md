# Auto-Hacker

![License](https://img.shields.io/github/license/isaac-0414/auto-hacker)
[![Python](https://img.shields.io/badge/Python-3.8%2B-blue.svg)](https://www.python.org/)

## Table of Contents

- [Overview](#overview)
- [Installation](#installation)
- [Usage](#usage)
- [Testing](#testing)
- [Demo](#demo)
- [License](#license)

## Overview

Auto-Hacker is a LLM agent that can autonomously hack websites. This project is based on the paper "[LLM Agents can Autonomously Hack Websites](https://arxiv.org/abs/2402.06664)" by Richard Fang, Rohan Bindu, Akul Gupta, Qiusi Zhan, and Daniel Kang. Currently it only supports SQL injection.

In recent years, LLMs have become adept at interacting with tools, reading documents, and recursively calling themselves, which enables these models to function as autonomous agents. This repository illustrates the capabilities of such LLM agents, performing SQL injections.

**Important: This repository is meant for educational and research purposes only. Always obtain proper authorization before hacking any website.**

## Installation

### Requirements

- Python 3.8+
- OpenAI API key (for GPT-4 access)
- Required Python packages listed in `requirements.txt` (Can be installed with provided shell script)

### Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/isaac-0414/auto-hacker.git
   cd auto-hacker
   ```

2. Create a `.env` file with your OpenAI API key
   ```env
   OPENAI_API_KEY=YOUR_OPENAI_API_KEY
   ```
   
## Usage

### Basic Usage

1. For Mac and Linux users
   ```bash
   ./run.sh
   ```
2. For Windows users
   ```cmd
   ./run.bat
   ```

3. After installing all the dependencies, the program will ask you the website you want to hack, type in the URL.

## Testing

I provide 3 sandbox websites which are deliberately made vulnerable to SQL injection and can run on your localhost with a MySQL database. All the websites run on http://localhost:3000/. You should set up your MySQL database and install Node.js on your machine before running any of these following commands.

1. Website 1: A simple login form (Express.js + MySQL)
   ```bash
   cd ./sandbox_websites/1
   ```
   
   ```bash
   npm install
   ```
   
   ```bash
   npm run start
   ```

2. Website 2: A simple search form with no quotes in SQL query (Express.js + MySQL)
   ```bash
   cd ./sandbox_websites/2
   ```

   ```bash
   npm install
   ```

   ```bash
   npm run start
   ```

3. Website 3: A more complicated website with a login form (React.js + Express.js + MySQL)
   ```bash
   cd ./sandbox_websites/3/frontend
   ```

   ```bash
   npm install
   ```

   ```bash
   npm run dev
   ```

   ```bash
   cd ./sandbox_websites/3/backend
   ```

   ```bash
   npm install
   ```

   ```bash
   npm run start
   ```
   

## Demo
Check out these 3 demos, which corresponding to the 3 sandbox websites above, at:
[https://drive.google.com/drive/folders/1xQdqtv397OW8kj9S2VHwwS_JnYP1SwOg?usp=sharing](https://drive.google.com/drive/folders/1xQdqtv397OW8kj9S2VHwwS_JnYP1SwOg?usp=sharing)

1. Demo 1: Hacking into the site with a simple login form
2. Demo 2: Trying 5 different SQL injection payloads until success
3. Demo 3: Hacking into a more complicated website with a lot of animations

**Note: The demonstrations is a little bit slow due to the unstable network connection when the video was recorded.**


## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Disclaimer: This software is provided for educational purposes only. The authors and contributors are not responsible for any misuse of the software. Always obtain proper authorization before attempting to hack any website.**
