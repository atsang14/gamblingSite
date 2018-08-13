
var config = {
    apiKey: "AIzaSyD_qURuCUdBESLqgWn4antWWaeo9ehikp8",
    authDomain: "project-1-814ab.firebaseapp.com",
    databaseURL: "https://project-1-814ab.firebaseio.com",
    projectId: "project-1-814ab",
    storageBucket: "project-1-814ab.appspot.com",
    messagingSenderId: "806088385313"
};

firebase.initializeApp(config);

// Create a variable to reference the database.
var database = firebase.database();

// -------------------------------------------------------------- (CRITICAL - BLOCK) --------------------------- //
// connectionsRef references a specific location in our database.
// All of our connections will be stored in this directory.
var connectionsRef = database.ref("/connections");

// '.info/connected' is a special location provided by Firebase that is updated every time
// the client's connection state changes.
// '.info/connected' is a boolean value, true if the client is connected and false if they are not.
var connectedRef = database.ref(".info/connected");

connectedRef.on("value", function(snap) {
  
  // If they are connected..
  if (snap.val()) {

    // Add user to the connections list.
    var con = connectionsRef.push(true);

    // Remove user from the connection list when they disconnect.
    con.onDisconnect().remove();
  }

});


// When first loaded or when the connections list changes...
connectionsRef.on("value", function(snap) {

  // Display the viewer count in the html.
  // The number of online users is the number of children in the connections list.
  $("#online").text(snap.numChildren());
});

// ----------------------------------------------------------------------
// ------------------------Flip Coin-------------------------------------
// ----------------------------------------------------------------------

var clearDiv 		   = 0;
var pastResultsArray   = [];
var currentUrl		   = '';
var users 			   = [];
var loggedInUser	   = ''; // this variable holds the userName of the Currently logged in user.
var loggedInUserWallet = 0;
var pot 			   = 0;  // STORE THE POT IN THE RESULTSCOUNTER IN pastResultArray object. called pot
var heads = [];
var tails = [];

$('.coin-flip').hide();

// take a snapshot of the users object in firebase in order to reference
// from later on in code	
database.ref().on('value', function(snapshot) {
		
		users = snapshot.val().users;

	});

	// this takes a snapshot of the pastResultArray and then appends it to page.
	// this is used in order to make the game appear real-time.
database.ref("/pastResultsCounter").on("value", function(snapshot) {

	pastResultsArray = snapshot.val().pastResultsArray;
	
	$('#pastResults').text('');
	
	for (var i = 0; i < 10; i++) {

		var span = $('<span>').text(pastResultsArray[pastResultsArray.length - (i+1)].timeStamp);
		var p = $('<p>').append(pastResultsArray[pastResultsArray.length - (i+1)].timeResult);
		p.append('\t').append(span);
		$('#pastResults').prepend(p);
	}

	$('.images').attr('src', snapshot.val().imgUrl);

	heads = [];
	tails = [];

});

// when user clicks button run the game
$(document).on('click','.flip',function() {

	flipCoin();

});

// this function flips coin and randomizes which will be displayed depending 
// on the randomization.
function flipCoin() {

	// here i need to grab the users who picked heads and tails. And then after flip coin, clear those arrays.
	var timeStamp 	= new Date().toISOString();
	var random 		= Math.floor(Math.random() * 2);
	
	$('#pastResults').text('');
 	
	if (random == 0) {
		
		for(var j = 0; j < heads.length; j++) {

			var amountBet  				  = parseInt(heads[j].amountBet);
			heads[j].won   				  = amountBet * 2;
			heads[j].userWalletAfterFlip  = heads[j].userWalletAfterBet + heads[j].won;
			if(heads[j].user == loggedInUser) {
				loggedInUserWallet = heads[j].userWalletAfterFlip;
			}
		}

		var result = {
			timeStamp: timeStamp,
			timeResult: 'Heads',
			heads,
			tails
		}


		$('.images').attr('src', 'http://random-ize.com/coin-flip/us-quarter/us-quarter-front.jpg');

		pastResultsArray.push(result);
		
		for (var i = 0; i < 10; i++ ) {

			var span = $('<span>').text(timeStamp);
			var p    = $('<p>').append(pastResultsArray[pastResultsArray.length - (i+1)].timeResult);
			p.append('\t').append(span);
			$('#pastResults').append(p);			
		}
		
		database.ref("/pastResultsCounter").set({
    		pastResultsArray,
    		imgUrl: 'http://random-ize.com/coin-flip/us-quarter/us-quarter-front.jpg'
 		});
		
		heads = [];
		tails = [];

		database.ref('/currentPot').set({
			heads,
			tails
		});

	} else if (random == 1) {
		
			for(var j = 0; j < tails.length; j++) {
			
			var amountBet  				  = parseInt(tails[j].amountBet);
			tails[j].won   				  = amountBet * 2;
			tails[j].userWalletAfterFlip  = tails[j].userWalletAfterBet + tails[j].won;
			if(tails[j].user == loggedInUser) {
				loggedInUserWallet = tails[j].userWalletAfterFlip;
			}
		}


		var result = {
			timeStamp: timeStamp,
			timeResult: 'Tails',
			heads,
			tails
		}
		
		$('.images').attr('src', 'http://random-ize.com/coin-flip/us-quarter/us-quarter-back.jpg');
		
		pastResultsArray.push(result);

		for (var i = 0; i < 10; i++ ) {
			var span = $('<span>').text(timeStamp);
			var p = $('<p>').append(pastResultsArray[pastResultsArray.length - (i+1)].timeResult);
			p.append('\t').append(span);
			$('#pastResults').append(p);
		}

		database.ref("/pastResultsCounter").set({
    		pastResultsArray,
    		imgUrl: 'http://random-ize.com/coin-flip/us-quarter/us-quarter-back.jpg'
 		});


		heads = [];
		tails = [];

 		database.ref('/currentPot').set({
			heads,
			tails
		});
	}
}

$('.logOut').on('click', function() {

	$('.login-page').show();
	$('.coin-flip').hide();

});


// ----------------------------------------------------------------------
// ------------------------LoginInfo-------------------------------------
// ----------------------------------------------------------------------

$('.userId').hide();
$('.userLogin').hide();

$('#register').on('click', function() {

	$('#register').hide();
	$('#signIn').hide();
	$('.userId').show();

});

// user creates an account if they click 'Register' button
// if the userName or email has already been take (checked by looping through the users object stored in firebase) the we 
// tell the user the email or userName has already been taken.

$('#submit').on('click', function() {

	event.preventDefault();	

	var userName = '';
	var	email	 = '';
	var password = '';
	var timeStamp 	= new Date().toISOString();

	var errorUserName = 'User Name has already been take. Please choose another user name.';

	var errorEmail 	  = 'Email is already in use, please use another email address';
	
	var userNameAndEmailError = 'Both Username and Email are currently in use. Please try again :]';

	$('#message-display').text('');

	userName 	 = $('#userName').val().toLowerCase().trim();
	email	 	 = $('#email').val().toLowerCase().trim();
	password 	 = $('#password').val().toLowerCase().trim();

	if ((userName == '') || (email == '') || (password == '')){

		$('#message-display').append('Finish The Form *****');
		return;

	}

	for (var key in users) {

		if((userName === users[key].user_Name) && (email === users[key].user_Email)){

			$('#message-display').append(userNameAndEmailError);
			return;

		} else if (email === users[key].user_Email) {

			$('#message-display').append(errorEmail);
			return;

			} else if (userName === users[key].user_Name) {

				$('#message-display').append(errorUserName);
				return;
			}
		}

	var userInfo     = {

		user_Name: userName,
		user_Email: email,
		user_Password: password,
		status: 'Logged In',
		wallet: 100,
		time_Account_Created: timeStamp,
		chat: []

	}		

	database.ref('/users').push(
		userInfo
  	);

	loggedInUser = userName;

  	$('#userName').val('');
  	$('#email').val('');
  	$('#password').val('');

  	// Display page wanted here after user created an account
  	$('.login-page').hide();
  	$('.coin-flip').show();

  	$('#currentUser').text(loggedInUser);

});

$('#signIn').on('click', function() {

	$('#register').hide();
	$('#signIn').hide(); 
	$('.userLogin').show();

});

// when user clicks submit, this code will check to see if 
// it's in the database and if the user name and password matches the information in the database.
// if it does, it allows the user to see the page.
// if it doesn't then user cannot log in.
$('#submitLogin').on('click', function() {

	event.preventDefault();	

	var userName = '';
	var password = '';
	userName 	 = $('#loginUserName').val().toLowerCase().trim();
	password 	 = $('#loginPassword').val().toLowerCase().trim();

	var errorMsg = 'Wrong user Name or Password';

	$('#message-display').text('');

	if ((userName == '') || (password == '')){

		$('#message-display').append('Finish The Form *****');
		return;

	}
	
	$('#message-display').text('');

	for(var keys in users) {

		if ((userName === users[keys].user_Name) && (password === users[keys].user_Password)) {

			alert("You are now logged in!");
			
			// show page once login here
			
			// Show user name and wallet of user
			loggedInUser 	   = userName;
			loggedInUserWallet = users[keys].wallet;

			$('#loginUserName').val('');
			$('#loginPassword').val('');
			
			$('.login-page').hide();
  			$('.coin-flip').show();

  			$('#currentUser').text(loggedInUser);
  			$('#currentWallet').text('$'+loggedInUserWallet);
			
			return;

		} 
	}
	
	$('#message-display').append(errorMsg);

});

// this back button brings the user to the option menu
// where they can chose to register or log in.
$('#back').on('click', function() {

	$('.form-pages').hide();
	$('.beginning-page').show();

}); 


//-----------------------------------------------------------------------
//-------------------------ChatBox---------------------------------------
//-----------------------------------------------------------------------

// updates the chatBox in database when user sends a message.
// also adds an array of objects in the users object that 
// shows the date and time of when the user sent the message.
database.ref().on("value", function(snapshot) {

    $('.theChatBox').text('');
    var chatBoxStart         = [];
    chatBoxStart       		 = snapshot.val().chatBox;
    var counter     		 = 0;
    var displayChat 		 = [];
    
    for(var theKey in chatBoxStart) {
    	counter ++;
  	}

  	var weWant      = counter - 9;
  	var newCounter  = 0;

    for(var theKeys in chatBoxStart) {
    	newCounter++;
    	if(newCounter == weWant) {
      		displayChat.push(chatBoxStart[theKeys]);
      		weWant++;
      		if(weWant > counter){
        		break;
      		}
    	}
  	}

  	for (var i = 0; i < 10; i++) {
    	var pTag    = $('<p>').append(displayChat[i].userNameSent+': '+displayChat[i].chatText);
    	$('.theChatBox').append(pTag);
  	}
  	
});

// when user clicks send, updates the page for everybody tuned in
$('#send').on('click', function() {
	
    event.preventDefault(); 
    
    var timeStamp   = new Date().toISOString();
    var chatText    = '';
    var chatArrayObject  = [];
    chatText        = $('#userInput').val();
    
    if(chatText != '') {
    
      	var chatObject  = {
	        
	        timeStamp: timeStamp,
	        chatText: chatText,
	        userNameSent: loggedInUser

      	}
    
      	// hell is happening between line 93 - 95
     	database.ref('/chatBox').push(
        	chatObject
      	);	
  		$('#userInput').val('');
		
  		////////////////////////////////////////
  		// this code here was used to access the /users object
  		// review this when you need to access /users
  		// 542 ~ 583
  		////////////////////////////////////////
      	var chatArrayObject  = [];
      	database.ref().on("value", function(snapshot) {

			var objectChatObject = [];
			var chat 			 = snapshot.val().chatBox;
			var users 			 = snapshot.val().users;
	
			
			for(var keyObject in chat) {
				objectChatObject.push(chat[keyObject]);
			}
			
			for(var x = 0; x < objectChatObject.length; x++) {
				
				var text = objectChatObject[x].chatText;
				var time = objectChatObject[x].timeStamp;
				var name = objectChatObject[x].userNameSent;
				
				if(name == loggedInUser){
					
					var object = {
						text:text,
						time:time,
						name: name
					}

					chatArrayObject.push(object);
	
				}
			}
			
		});
   		
      	var key = '';
   		for(var aKey in users) {
   			if(users[aKey].user_Name == loggedInUser){
   				key = aKey
   			}
      	}
      	database.ref('/users/'+key+'/chatHistory').set(
			chatArrayObject
		);
	}
	});


//-----------------------------------------------------------------------
//-------------------------PlaceBets-------------------------------------
//-----------------------------------------------------------------------

var betInfo = {};

$('#heads').on('click', function() {

	var timeStamp = new Date().toISOString();; 
	var userBets  = $('#placeBet').val();

	if (userBets != '') {

		loggedInUserWallet -= parseInt(userBets);
		pot 			   += parseInt(userBets);

		$('#currentWallet').text(loggedInUserWallet);

		// betinfo object will be used to update the pastResultsArray
		betInfo = {
			
			user: loggedInUser,
			userWalletAfterBet: loggedInUserWallet,
			amountBet: userBets,
			timeStamp: timeStamp,
			choice: 'heads'

		}

		// push user info in to heads array, will do the same for tails
		heads.push(betInfo);
		
		var key = '';
		for(var anotherKey in users) {
			if(users[anotherKey].user_Name == loggedInUser) {
				key = anotherKey;
			}
		}

		// update currentPot object after each bet
		database.ref('/currentPot').set({
			heads,
			tails
		});

		// update userslogged in wallet
		database.ref('/users/'+key+'/wallet').set(
			loggedInUserWallet	
		);

		$('#placeBet').val('');

	} else {
		alert('Place a bet please');
	}
});

$('#tails').on('click', function() {

	var timeStamp = new Date().toISOString();; 
	var userBets  = $('#placeBet').val();
		
	if (userBets != '') {
		
		// THIS IS FOR IF THE USER LOSES ONLY. MAKE ONE FOR IF THE USER WINS
		// AND THEN ALSO MAKE IT TO CHECK WHETHER OR NOT THE USER HAS WON
		loggedInUserWallet -= parseInt(userBets);
		pot 			   += parseInt(userBets);

		$('#currentWallet').text(loggedInUserWallet);

		// betinfo object will be used to update the pastResultsArray
		betInfo = {
			
			user: loggedInUser,
			userWalletAfterBet: loggedInUserWallet,
			timeStamp: timeStamp,
			amountBet: userBets,
			choice: 'tails'

		}

		// push user info in to heads array, will do the same for tails
		tails.push(betInfo);

		var key = '';
		for(var anotherKey in users) {
			if(users[anotherKey].user_Name == loggedInUser) {
				key = anotherKey;
			}
		}

		// update currentPot object after each bet
		database.ref('/currentPot').set({
			heads,
			tails
		});

		// update userslogged in wallet
		database.ref('/users/'+key+'/wallet').set(
			loggedInUserWallet
		);



		$('#placeBet').val('');

	} else {
		alert('Place a bet please');
	}
});

// updates heads and tails div real time.
database.ref().on("value", function(snapshot) {

	// this is to clear all existing inside div becaues will be reappended
	// in for-loop
	$('.headsPlayers').text('');
	$('.tailsPlayers').text('');

	// UPDATE FOR HEADS & TAILS

	if(snapshot.val().currentPot != null) {
		var currentHeads = snapshot.val().currentPot.heads;
		var currentTails = snapshot.val().currentPot.tails;

		// the error is that these for loops must also update the local heads and tails arrays
		if(currentHeads != null) {
			for(var i = 0; i < currentHeads.length; i++ ) {
				heads[i]	   = currentHeads[i];
				var userName   = currentHeads[i].user;
				var userAmount = currentHeads[i].amountBet;
				var span	   = $('<span>').text(userAmount);
				var p 		   = $('<p>').text(userName+': $').append(span);
				$('.headsPlayers').append(p);
			}
		} else {
			heads = [];
		}

		if(currentTails != null) {
			for(var j = 0; j < currentTails.length; j++ ) {
				tails[j]	   = currentTails[j];
				var userName   = currentTails[j].user;
				var userAmount = currentTails[j].amountBet;
				var span	   = $('<span>').text(userAmount);
				var p		   = $('<p>').text(userName+': $').append(span);
				$('.tailsPlayers').append(p);
			}
		} else {
			tails = [];
		}

	} else {
		heads = [];
		tails = [];
	}
});