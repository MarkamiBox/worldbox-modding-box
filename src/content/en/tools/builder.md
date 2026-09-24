---
title: Content builder
group: Modding Tools
icon: :wbhammer:
order: 405
---

# Content builder :wbhammer:

Pick what you want to make, fill in the boxes, and you get the whole thing: the code file, the text for your `Locales` file, and exactly where to put your art. It writes the same code the guide pages teach, including the steps people always forget, like the pools, the post-init fields and the locale keys that do not match the id.

::tool:builder::

## How to use what it gives you

1. **The code** goes in your mod's `Code/` folder, in a file with the name shown on top of the block.
2. **The text** goes in `Locales/<language>.json`. If you already have that file, copy only the lines inside the `{ }` into it, and mind the commas.
3. **The art** goes exactly where the list says. Read the word next to each one: a **folder** means a folder of PNGs, even if you only have one frame. A single PNG where a folder belongs is the number one reason art does not show up :wbfacepalm:.
4. **The Main.cs line** goes inside `OnModLoad()`. Order matters: a trait that sits in your own tab needs the tab first, an item that costs your own resource needs the resource first.

Start the game and check the log. If something is off, the **Full explanation** link under the picker takes you to the page that covers that content in detail.

> [!TIP] Change the defaults
> Every id in the builder starts with `my_`. Change it to something that is yours, like `hello_` for HelloBox. Two mods that both add a `my_trait` fight over it, and only one of them wins :PESgn_Stop:.

## Templates

The last group in the picker, **Templates**, works differently. Creatures, buildings, disasters, AI, plots and windows are mostly your own logic, so there is no form that could write them for you. Instead you get the guide page's own working file, renamed to your namespace and your prefix. It compiles and runs as it is, and the page behind **Full explanation** walks through every line, so you know what to change.

## What it does not do

The builder gives you content that **works**. What it cannot do is invent your idea for you. Where a feature needs your own logic, like a trait that does something special or a power that does something new, it leaves a clearly marked `// your code here` spot. The page behind the **Full explanation** link shows what you can put there.
