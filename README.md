# scriptable-publish-to-micro-blog

## Overview

This is a script for the [Scriptable](https://scriptable.app) app on iOS. It allows you to publish a text/Markdown post to [Micro.blog](https://micro.blog) from any text editing app, using the iOS share sheet. It works via the [Micropub API](https://help.micro.blog/2017/api-posting/), which means that, with a few tweaks, it can be modified to work with other Micropub endpoints, as long as they support app token-based authentication.

## FAQ

### How do I install the script?

As a prerequisite, you must have the Scriptable app installed.

Copy the file `Publish to Micro.blog.js` to the "Scriptable" folder in iCloud Drive. That's it!

### How do I run the script?

The script is designed to be run from the share sheet from a text-editing app such as Notes, Drafts, iA Writer, or Ulysses. 

1. Enter some text in the text editor.
2. Tap on the "share" button that is provided by the text editor app, or select the text you want to publish, tap the selection, and tap the "Share..." option.
3. Tap the "Run Script" action that the Scriptable app provides. The first time you try this, you may need to go to "Edit Actions..." in the share sheet to enable the "Run Script" action.
4. The "Run Script" action will show the "Publish to Micro.blog" script along with any other Scriptable scripts you have installed. Tap on the "Publish to Micro.blog" script, and it will execute, with the text you sent to the share sheet as its input.

### How do I configure the script to post to _my_ blog?

The script handles authentication using app tokens, which it stores in and retrieves from the iOS Keychain.

1. Create an app token on [the Micro.blog Account page](https://micro.blog/account).
2. Copy that app token.
3. Execute the script for the first time, via a share sheet from a text-editing app.
4. The first time the script is run, it will prompt you to enter an app token. Paste the token you copied into the text box that appears and tap the OK button. Your app token will be stored securely in the iOS Keychain, so you will not have to enter it again.
5. Micro.blog will know, based on that app token, which blog to post to. No other authentication is necessary.

### How do I add a title to my post?

If you wish your post to have a title, start your post with a "level 1" Markdown heading ("# " in the first position of the first line of the text you send to the script), as shown in the example below. The first line, minus the "# " at the start of it, will be used as the title of your post.

This input will create a post with a title:

```
# Title of post

The body of the post goes below the title. Blank lines between the title and body of the post are optional and do not become part of the body of the post.
```

"Level 1" Markdown headings below the first line will _not_ be treated as post titles.

### What if I entered the wrong app token value and need to change it?

Uncomment the line containing `apiToken.clear();` and execute the script again. Remember to re-comment that line after running the script, or else you will be prompted for the app token on every execution.

### How can I post to different blogs (with different app tokens)?

The script cannot be used to post to multiple blogs, mainly because it is meant to accept the post text as its only input, but there is a workaround:

1. Make a copy of the script and give it a new name. You can use the "Duplicate Script" command in Scriptable to do this.
2. In the new copy of the script, find the line containing `keychainAppTokenKey = "my-script-to-publish-to-micro-blog";` and change the value of `keychainAppTokenKey` to a unique value. This will allow you to store another app token value in the Keychain, under a different name than the one used in the initial copy of the script.
3. The old and the new copies of the script will now be available, and each can post to a different blog using different app tokens.

### What if I want to publish to another Micropub endpoint, not Micro.blog?

The script can be modified to connect to another Micropub endpoint, and should work with non-Micro.blog Micropub endpoint as long as it supports app token-based authentication and is otherwise set up similarly to Micro.blog's Micropub implementation. To do so, look for the line `microPubEndPointURL = "https://micro.blog/micropub";` and change the URL to your Micropub endpoint.

### Can I run this script via the Shortcuts app?

Yes, this script can be executed via the Shortcuts app, like any other Scriptable script. You still need the Scriptable app installed, and have to add a Scriptable "Run Script" command to your custom Shortcut to execute the script.

__Important Note__: Shortcuts cannot display the prompt for the app token. _If the script is run from the Shortcuts app before the app token is set, then it will fail._ You must execute the script for the first time via Scriptable's "Run Script" command in a share sheet, so you can enter the app token. After the app token is stored, the script will not ask for it again.

### What is the return value of the script?

If the post is successful, the script returns `true`. If it is not successful, the script returns `false`. Success is determined from the Micropub endpoint's response. These return values may be useful if calling the script from another automation program, such as Shortcuts.
