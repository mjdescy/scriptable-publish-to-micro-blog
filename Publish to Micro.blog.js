// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-purple; icon-glyph: share-square;
// share-sheet-inputs: plain-text;
// PURPOSE: Post to Micro.blog hosted account, using its Micropub API.

// Library functions for strings
class StringHelperFunctions {
	constructor() {}
	static isH1Heading(str) {
		return (str.substr(0, 2) == "# ")
	}
	static isEmptyOrSpaces(str) {
		return (str === null || str.match(/^ *$/) !== null);
	}
}

// Class to hold the data for a MicroPub post
class MicroPubPost {
	title = "";
	body = "";
	makeH1HeadingInFirstLineThePostTitle = true;
	constructor() {}
	setTitleAndBodyByParsingRawContentText(rawContentText) {
		let firstLineIsH1Heading = StringHelperFunctions.isH1Heading(rawContentText);
		
		if (!this.makeH1HeadingInFirstLineThePostTitle || !firstLineIsH1Heading) {
			this.title = "";
			this.body = rawContentText;
			return
		}
		
		let rawContentLineArray = rawContentText.split("\n");
		
		// get the title from the first line of the input text
		let titleFromRawContentText = rawContentLineArray[0].slice(2);
		this.title = titleFromRawContentText; 
		
		// skip blank lines below the title (first line)
		let lineIndex = 1;
		while (StringHelperFunctions.isEmptyOrSpaces(rawContentLineArray[lineIndex])) {
			lineIndex += 1;
		}
				
		// get the body from the remainder of the input text
		var bodyFromRawContentText = "";
		for (var i = lineIndex; i < rawContentLineArray.length; i++) {
			bodyFromRawContentText += rawContentLineArray[i];
			if (i < rawContentLineArray.length) {
				bodyFromRawContentText += "\n";
			}
		}
		this.body = bodyFromRawContentText;
	}
}

// Class for getting and setting the Micro.blog app token via the Keychain.
class MicroBlogAppToken {
	keychainAppTokenKey = "my-script-to-publish-to-micro-blog-via-scriptable";
	constructor() {}
	get isStored() {
		return Keychain.contains(this.keychainAppTokenKey);
	}
	get value() {	
		if (this.isStored) {	
			return Keychain.get(this.keychainAppTokenKey);
		} else {
			return "";
		}		
	}
	// This function will not work if the script is called via Shortcuts, because it shows an alert.
	async askUserForTokenValue() {
		let alert = new Alert();
		alert.title = "Need App Token";
		alert.message = "Please enter your Micro.blog app token, generated on the Micro.blog account page.";
		alert.addTextField("App Token", "");
		alert.addAction("OK");
		alert.addCancelAction("Cancel");
		let showAlert = alert.presentAlert();
		let userChosenAction = await showAlert;
				
		if (userChosenAction == -1) {
			return "";
		} else {
			let newTokenValue = alert.textFieldValue(0);
			this.store(newTokenValue);
			return newTokenValue;
		}
	}
	store(token) {
		Keychain.set(this.keychainAppTokenKey, token);
	}
	async getValue() {
		if (this.isStored) {
			return this.value;
		} else {
			return await this.askUserForTokenValue();
		}
	}
	clear() {
		if (this.isStored) {	
			Keychain.remove(this.keychainAppTokenKey);
		}
	}
}

// Class for posting text to a MicroPub endpoint (Micro.blog by default).
class MicroPubPostPublisher {
	microPubEndPointURL = "https://micro.blog/micropub";
	appToken;
	constructor() {}
	async post(microPubPost) {
		console.log("post(microPubPost)");
		if (!microPubPost) {
			console.error("No micropub post object was provided.");
			return false;
		}
		
		return this.postBodyAndTitle(microPubPost.body, microPubPost.title);
	}
	async postBodyAndTitle(postBody, postTitle) {		
		if (!postBody) {
			console.error("No post content text was provided. Aborting.");
			return false;
		}
		
		if (!this.appToken) {
			console.error("No API token was provided. Aborting.");
			return false;
		}
		
		if (!this.microPubEndPointURL) {
			console.error("No MicroPub endpoint URL was provided. Aborting.");
			return false;
		}
	
 		let request = new Request(this.microPubEndPointURL);
 		request.method = "POST";
 		request.headers = {	
			"Authorization": "Bearer " + this.appToken
		};
		request.addParameterToMultipart("h", "entry");
		if (postTitle) {
			request.addParameterToMultipart("name", postTitle);
		}
		request.addParameterToMultipart("content", postBody);
		
		await request.load();
		
		let postWasSuccessful = (response.statusCode == 202 || response.statusCode == 200);
		return postWasSuccessful;
	}
}

// Execution starts here.

let shareSheetText = args.plainTexts[0];
let microPubPost = new MicroPubPost();
microPubPost.setTitleAndBodyByParsingRawContentText(shareSheetText);

let postPublisher = new MicroPubPostPublisher();
let appToken = new MicroBlogAppToken();
// Uncomment the following line if you need to re-enter your app token. Re-comment it when you are done.
// appToken.clear();
postPublisher.appToken = await appToken.getValue();
let postWasSuccessful = postPublisher.post(microPubPost);

Script.setShortcutOutput(postWasSuccessful);
Script.complete();
