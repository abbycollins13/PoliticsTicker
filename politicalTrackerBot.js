// Our Twitter library
var Twit = require('twit');

var text = "Keep engaging with the political community and don't forget to vote!"


var pre = "That's an interesting opinion. Why don't you check out this one: "
+ getRand();

// We need to include our configuration file
var T = new Twit(require('./config.js'));

// This is the URL of a search for the latest tweets on the '#politics' hashtag.
var politicsSearch = {q: "#politics", count: 10, result_type: "recent"}; 
var unbiasedSearch = {q: "unbiased politics" , count: 10, result_type: "recent"}; 


Array.prototype.pick = function() {
	return this[Math.floor(Math.random()*this.length)];
}
Array.prototype.remove = function() {
    var what, a = arguments, L = a.length, ax;
    while (L && this.length) {
        what = a[--L];
        while ((ax = this.indexOf(what)) !== -1) {
            this.splice(ax, 1);
        }
    }
    return this;
};

function getRandIndex(array) {
  var index = Math.floor(array.length*Math.random());
  return array[index];
}

function getRand() {
  articles = [
  'http://news.nationalpost.com/2014/10/31/u-s-midterm-elections-will-not-be-kind-to-democrats-a-war-without-shooting/#__federated=1',
  'http://www.nytimes.com/2014/11/01/us/politics/what-is-on-the-line-in-the-midterm-elections.html?hp&action=click&pgtype=Homepage&module=second-column-region&region=top-news&WT.nav=top-news&_r=0',
  'http://www.nola.com/politics/index.ssf/2014/11/early_votes_nationwide_exceed.html',
  'http://www.washingtonpost.com/blogs/fact-checker/wp/2014/10/31/the-most-fact-challenged-ads-of-the-2014-midterm-elections/',
  'http://www.theroot.com/articles/politics/2014/10/midterm_elections_2014_this_is_where_we_break_it_down_for_you.html',
  'http://www.theguardian.com/us-news/2014/oct/31/-sp-us-midterm-elections-the-guardian-briefing',
  'http://time.com/3552452/iowa-north-carolina-senate-race-midterm-elections/',
  'http://www.economist.com/news/leaders/21629371-if-moderates-dont-vote-next-week-extremists-will-thrive-silent-centre',
  'http://www.cnn.com/2014/11/01/politics/gop-senate-midterms/index.html?hpt=po_c1',
  'http://www.foxnews.com/politics/2014/11/01/governor-race-in-deep-blue-maryland-now-among-tightest-garnering-big-money-and/',
  ];
  var article = getRandIndex(articles);
  return article;
}

function tweet() {

	var tweetText = pre.pick();

	if(debug) 
		console.log('Debug mode: ', tweetText);
	else
		T.post('statuses/update', {status: tweetText }, function (err, reply) {
			if (err != null){
				console.log('Error: ', err);
			}
			else {
				console.log('Tweeted: ', tweetText);
			}
		});
}

function retweetLatest() {
    

	T.get('search/tweets', politicsSearch, function (error, data) {
	  // log out any errors and responses
	  console.log(error, data);

	  // If our search request to the server had no errors...
	  if (!error) {
	  	// ...then we grab the ID of the tweet we want to retweet...
		var retweetId = data.statuses[0].id_str;
		// ...and then we tell Twitter we want to retweet it!
		
		T.post('statuses/retweet/' + retweetId, { }, function (error, response) {

			if (response) {
				console.log('Success! Check your bot, it should have retweeted something.')
			}
			// If there was an error with our Twitter call, we print it out here.
			if (error) {
				console.log('There was an error with Twitter:', error);
			}

		})
	  }
	  // However, if our original search request had an error, we want to print it out here.
	  else {
	  	console.log('There was an error with your hashtag search:', error);
	  }
	});
}

function respondToMention() {
	T.get('statuses/mentions_timeline', { count:100, include_rts:0 },  function (err, reply) {
		  if (err !== null) {
			console.log('Error: ', err);
		  }
		  else {
		  	mention = reply.pick();
		  	mentionId = mention.id_str;
		  	mentioner = 'RT @' + mention.user.screen_name;
		  	
		  	var tweet = mentioner + " " + text;

				T.post('statuses/update', {status: tweet, in_reply_to_status_id: mentionId }, function(err, reply) {
					if (err !== null) {
						console.log('Error: ', err);
					}
					else {
						console.log('Tweeted: ', tweet);
					}
				});
		  }
	});
}

function followAMentioner() {
	T.get('statuses/mentions_timeline', { count:50, include_rts:1 },  function (err, reply) {
		  if (err !== null) {
			console.log('Error: ', err);
		  }
		  else {
		  	var sn = reply.pick().user.screen_name;
			if (debug) 
				console.log(sn);
			else {
				//Now follow that user
				T.post('friendships/create', {screen_name: sn }, function (err, reply) {
					if (err !== null) {
						console.log('Error: ', err);
					}
					else {
						console.log('Followed: ' + sn);
					}
				});
			}
		}
	});
}

function retweetRecent() {
    T.get('search/tweets', politicsSearch, function (err, data,response) {
        if (!err) {
            var tweet = data.statuses[0];
            var retweetBody = '@' + tweet.user.screen_name + ' ' + pre;
            T.post('statuses/update',{status:retweetBody}, function (err,response) {
                if (response) {
                    console.log('Quote Tweeted Tweet ID: ' + tweet.id_str);
                }
                if (err) {
                    console.log('Quote Tweet Error: ', err);
                }
            });
        } else {
            console.log('Search Error: ', err);
        }
    });
}

retweetRecent();
setInterval(retweetRecent, 1800000);

function favorite() {
    T.get('search/tweets', unbiasedSearch, function (err,reply) {
    	var tweets = reply.statuses;
    	var randomTweet = randIndex(tweets);
    T.post('favorites/create', { id: randomTweet.id_str }, reply);
               
    });
};

favorite();

function runBot() {
	console.log(" "); // just for legible logs
	var d=new Date();
	var ds = d.toLocaleDateString() + " " + d.toLocaleTimeString();
	console.log(ds);  // date/time of the request	
		
		///----- NOW DO THE BOT STUFF
		var rand = Math.random();


	if (rand <= 0.80) {
			console.log("-------Tweet something @someone");
			respondToMention();
			
		// } else {
		// 	console.log("-------Follow someone who @-mentioned us");
		// 	followAMentioner();
		// }
	}	
}


function randIndex (arr) {
  var index = Math.floor(arr.length*Math.random());
  return arr[index];
};

var CustomRequestSigner = function(name) {
  this.name = name;
};

CustomRequestSigner.prototype.apply = function(obj, authorizations) {
  var hashFunction = this._btoa;
  var hash = hashFunction(obj.url);

  obj.headers["signature"] = hash;
  return true;
};

// Try to retweet something as soon as we run the program...
retweetLatest();
runBot();

// ...and then every hour after that. Time here is in milliseconds, so
// 1000 ms = 1 second, 1 sec * 60 = 1 min, 1 min * 60 = 1 hour --> 1000 * 60 * 60
setInterval(retweetLatest, 1000 * 60 * 60);
