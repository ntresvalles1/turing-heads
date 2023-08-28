# Internship Hackathon Project

## Set-Up
### To setup local React website:
1. Ensure you are in the right folder (basic folder)! 
2. Run npm install
3. Run npm start
4. Run node server.js (in basic folder)

### To create a new API Key:
1. Go to platform.opanai.com
2. Create/Log-in to account
3.  Go to API keys. Generate a new one, if needed.
4. Copy this API key into:
-  server.js under "apiKey"
-  In Postman, under "Authorization" replace the "Token" 



## Summary of project: 
- Let’s say that you’re a freelancer that’s looking for an efficient way to set-up a website, we know that WordPress is nice for making websites. However, with the 24/7 apache servers, there are security issues. But why is that? It's because when we have a WordPress instance, there’s a PHP server that runs 24/7 in the background that fetches from a database and then responds live to the web browser.
- With this solution of making a local static WordPress there are a few benefits: 
  1. First, we use a local client. We have the entire PHP server running locally in web assembly so PHP is compiled with web assembly to run within a browser & the database is converted to SQLite, also in browser. Therefore, there is no attacking surface. 
  2. We output static HTML files. This is great because it’s faster and it can be optimized.
  3. Allows generation of some of the content & programmatic injection using ChatGPT. Basically, a user can ask ChatGPT for some suggestions, which will get included in the website

## Tech Stack: 
- Figma for the Design
- JavaScript & React for the website
- SwiftUI for the app
- Swift
- Wordpress Playground (PhP -> WASM) + SqLite

## Next Steps:
- Some next steps we want to take this product is to create more than just an AI generated personal website, but have an AI generated website for more categories such as Photography Site, Blogs, Restaurants, social media, and events! Ideally we can use static pages for this everywhere because after all, they are more secure, more efficient and more reliable. 




