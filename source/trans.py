import json

GHOST_FILE = """---
title: {title}
tags: 
    {tags}
categories:
    {categories}
date: {date}
updated: {update}
{thumbnail}
---
{content}"""
def main(inputFile):
    with open(inputFile, 'r') as file:
        content = json.load(file)["db"][0]["data"]
        for item in content["posts"]:
            with open("_posts/{}.md".format(item["slug"]), 'w') as writer:
                con = GHOST_FILE.replace("{title}", item["title"].encode('utf-8'))
                con = con.replace("{date}", item["created_at"].encode('utf-8'))
                con = con.replace("{update}", item["updated_at"].encode('utf-8'))
                writer.write(con)

if __name__ == "__main__":
    main("ghost.2017-12-27.json")
