After creating a CSV to JSON converter (also found in this repository), I thought it might be cool to use the code in a more concrete
project. That's how this project was born. You can upload a bank statement which at least where I'm from can easily be downloaded
as a csv file from your online bank, and the app then converts the file to JSON behind the scenes and calculates income and expenses,
as well as the difference between the two. To make this work, the app first asks you to map the csv headers correctly, although I've made some
attempt to automate this. 

The data is not stored in any database. Everything happens in the browser. The data is only momentarily stored in local storage 
when the file is read but then immediately removed after the data has been processed. 

In the future I plan to add a feature to display and group the income and expenses by recipient.

Why did I create this, since you only have to log in to a modern online bank to see all this stuff and even have your expenses grouped 
by category in some cases? It's mainly for my own practice and for trying out certain features. I don't expect anyone else to want to use
this, because who would want to upload their bank statement to an app a stranger made, not knowing for sure what they're going to do 
with it? 
