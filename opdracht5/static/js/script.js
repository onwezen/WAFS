// Put everything in an IFFE so there are no global variables
(function() {
	'use strict'; // Use strict mode so no global variables can be declared

	// The application object
	var app = {
		init: function() {
			el.init();
			states.init();
			search.init();
			watchlist.getStorage();
		}
	};

	// Object where elements are declared
	var el = {
		init: function() {
			this.searchScreen = document.getElementById('search');
			this.watchlistScreen = document.getElementById('watchlist');
			this.detailScreen = document.getElementById('detail_container');
			this.navSearch = document.getElementById('nav-search');
			this.navWatchlist = document.getElementById('nav-watchlist');
			this.list = document.getElementById('list');
			this.listWatchlist = document.getElementById('list-watchlist');
			this.form = document.getElementById('form');
			this.submitButton = document.getElementById('submit');
			this.searchvalue = document.getElementById('searchvalue');
			this.firstLih1 = document.querySelector('#list li:first-child h1');
			this.loading = document.querySelectorAll('.loading');
		}
	}

	// Router object
	var states = {
		// Declare all routes
		routes: ['search', 'watchlist', 'detail'],
		init: function() {
			// Fire router function on hash change and on refresh
			window.addEventListener("hashchange", this.router.bind(this), false)
			window.addEventListener("load", this.router.bind(this), false)		
		},
		router: function() {
			// Declare hash as the current hash without #
			var hash = window.location.hash.replace('#', '');
 
			// Remove everything after the slash. Source: http://stackoverflow.com/questions/5631384/remove-everything-after-a-certain-character
			var s = hash;
			var n = s.indexOf('/');
			hash = s.substring(0, n != -1 ? n : s.length);

			// If no hash, set the hash to #search
			if (!hash) {
				window.location.hash = 'search';
			} else if (hash == 'detail') {
				// If the hash is detail load the id after the slash and send it detail.pushToArray to render the right information
				var id = window.location.hash.replace('#detail/', '')
				detail.pushToArray(id);
			}

			// Loop throug the routes
	    	for(var i = 0; i < this.routes.length; i++) {
	    		// Find the element of the current route
	    		var elem = document.querySelector('#'+this.routes[i]);
	    		// Find the a where href is equal to the hash.
	    		var active = document.querySelector('#navigation a[href="#'+this.routes[i]+'"]');
	    		// If the route is the hash, display the right section and make the right menu button active. If not, do the opposite
	    		if(this.routes[i] != hash) {
	    			elem.style.display = 'none';
	    			if (active) {
	    				active.parentElement.classList.remove('active-menu-button');
	    			};
	    		} else {
	    			elem.style.display = '';
	    			if (active) {
	    				active.parentElement.classList.add('active-menu-button');
	    			};
	    		};
	    	}
		}
	}
	
	// Object for searching movies
	var search = {
		searchResults: [],
		init: function() {
			this.submit();
			this.emptyList();
		},
		emptyList: function() {
			// If the list is empty, hide the list. If not, show the list
			if (el.firstLih1.value) {
				el.list.style.display = '';
			} else {
				el.list.style.display = "none";
			}
		},
		apiCall: function(search) {
			// Declare new Promise function
			var promise = new Promise(function (resolve, reject) {
				var xhr = new XMLHttpRequest();

				xhr.onloadstart = function() {
					this.loading('show', el.list);
				}.bind(this)

				xhr.onloadend = function() {
					this.loading('hide', el.list);
				}.bind(this)

				// Encode search string as URI
				var searchURI = encodeURI(search)

				xhr.open('GET', 'http://www.omdbapi.com/?s='+searchURI+'&r=json', true); // Get data from the url
				xhr.send(null);

				// When the data is received
				xhr.onreadystatechange = function() {
					// Check if the data is ready
				    if (xhr.readyState == XMLHttpRequest.DONE) {
				    	var status = xhr.status;
				    	// Check if an object is received
				    	if( (status >= 200 && status < 300) || status === 304 ) {
				    		var json = JSON.parse(xhr.responseText);
				    		// Tell the promise it succeded and return the object
				        	resolve(json);
				    	} else {
				    		// Tell the promise an error occurred
				    		reject(json);
				    	}
				    }
				}
			}.bind(this))
			return promise;
		},
		pushToArray: function(search) {
			// Fire apiCall with the search string
			this.apiCall(search)
				.then(function (object) {
					// When the data is succesfully received, object = searchResults. Then render and display the list
					this.searchResults = object;
					this.filter();
					this.render();
				}.bind(this))
				.catch(function() {
					// If an error occurred, alert there is something wrong
					alert('Something went wrong')
				})
		},
		submit: function() {
			// Add event listener to submit of the form button
			el.form.addEventListener("submit", this.getValue.bind(this) )
		},
		loading: function(state, elem) {
			if (state == 'show') {
				// Hide the list and show the loading gif
				elem.style.display = 'none';
				for (var i = 0; i < el.loading.length; i++) {
					el.loading[i].style.display = 'block';
				}
			} else {
				// Show the list and hide the loading gif
				elem.style.display = '';
				for (var i = 0; i < el.loading.length; i++) {
					el.loading[i].style.display = 'none';
				}
			}
		},
		getValue: function(e) {
			// Prevent refreshing
			e.preventDefault();
			// Get value of the search input
			var value = el.searchvalue.value;
			// Fire  pushToArray
			this.pushToArray(value);
		},
		filter: function() {
			// Returns an array with all movie titles
			var titleArray = _.map(this.searchResults.Search, function (value) {
			    return value.Title
			});

			// Returns all titles as a string
			var titleString = _.reduce(this.searchResults.Search, function (str, movie) {
			    return movie.Title + str;
			}, '');

			// Filter out all the movies without an image
			var goodImages = _.filter(this.searchResults.Search, function(out){ 
				return out.Poster != 'N/A'; 
			});
			// Place the object as the new searchresults object
			this.searchResults = goodImages;
		},
		render: function() {
			// Declare all functions to get data from object
			var liId = function() {return 'searchLi-'+this.imdbID}
			var href = function() {return '#detail/'+this.imdbID}
			var valueId = function() {return this.imdbID}
			var title = function() {return this.Title}
			var img = function() {return this.Poster}
			var year = function() {return this.Year}
			var checkboxId = function() {return 'checkboxSearch-'+this.imdbID}

			// Object to let Transparency know what values to give which element
			var directives = {
			  ahref: {href: href},
			  searchresult: {id: liId, value: valueId},
			  img: {src: img},
			  title: {text: title},
			  year: {text: year},
			  checkbox: {id: checkboxId, value: valueId},
			  label: {for: checkboxId}
			};

			// Render
			Transparency.render(el.list, this.searchResults, directives);

			// Link the object to the right checkbox, so we can get the object when we click it
			var results = el.list.children;
			for (var i = 0; i < results.length; i++) {
				var data = this.searchResults[i];
				results[i].querySelector('input[type="checkbox"]').data = data;
			};

			// There are new checkboxes, so fire watchlist.init
			watchlist.init();
		}
	}

	// Detail state object
	var detail = {
		// The object with the detailed data
		detailObject: [],
		apiCall: function(id) {
			// Declare new Promise function
			var promise = new Promise(function (resolve, reject) {
				var xhr = new XMLHttpRequest();

				// When it starts getting data, show the loader
				xhr.onloadstart = function() {
					search.loading('show', el.detailScreen);
				}
				// When its done getting the data, hide the loader
				xhr.onloadend = function() {
					search.loading('hide', el.detailScreen);
				}

				xhr.open('GET', 'http://www.omdbapi.com/?i='+id+'&r=json&plot=full', true);
				xhr.send(null);

				// When data is ready, resolve the object
				xhr.onreadystatechange = function() {
				    if (xhr.readyState == 4) {
				        var json = JSON.parse(xhr.responseText);
				        resolve(json);	    
					}
				};
			})
			return promise;
		},
		pushToArray: function(id) {
			// Fire apiCall. When the data is succesfully received, object = searchResults. Then render and display the list
			this.apiCall(id).then(function (object) {
				this.detailObject = object;
				this.render();
			}.bind(this))
			.catch(function() {
				// If an error occurred, alert there is something wrong
				alert('Something went wrong')
			});		
		},
		render: function() {
			// Declare all functions to get data from object
			var valueId = function() {return this.imdbID}
			var title = function() {return this.Title}
			var img = function() {return this.Poster}
			var year = function() {return this.Year}
			var checkboxId = function() {return 'checkboxDetail-'+this.imdbID}
			var rating = function() {return 'IMDb: '+this.imdbRating}
			var actors = function() {return this.Actors}
			var description = function() {return this.Plot}

			// Object to let Transparency know what values to give which element
			var directives = {
			  detail_img: {src: img},
			  detail_rating: {text: rating},
			  detail_title: {text: title},
			  detail_year: {text: year},
			  detail_checkbox: {id: checkboxId, value: valueId},
			  detail_label: {for: checkboxId},
			  actors: {text: actors},
			  description: {text: description}
			};

			// Render
			Transparency.render(el.detailScreen, this.detailObject, directives);

			// Link the object to the right checkbox, so we can get the object when we click it
			el.detailScreen.querySelector('input[type="checkbox"]').data = this.detailObject;
			
			// There are new checkboxes, so fire watchlist.init
			watchlist.init();
		}
	}

	var watchlist = {
		watchlist: [],
		init: function() {
			// Add click events to all checkboxes
			var checkboxes = document.querySelectorAll('input[type="checkbox"]');
			for (var i = 0; i < checkboxes.length; i++) {
				checkboxes[i].addEventListener("click", this.pushToArray)
			};
			// Fire checkSync
			this.checkSync();		
		},
		getStorage: function() {
			// Check if an object is saved in local storage
			var storage = JSON.parse(localStorage.getItem('watchlist'));
			if (storage) {
				// If the object exists, render the watchlist
				this.watchlist = storage;
				this.render();
			}
		},
		pushToArray: function() {
			// Check if the checkbox is checked
			if (this.checked) {
				// If checked, push to array
				watchlist.watchlist.push(this.data);
			} else {
				// If not checked, go through the watchlist and check what object is matching the clicked checkbox
				for (var i = 0; i < watchlist.watchlist.length; i++) {
					if(watchlist.watchlist[i].imdbID == this.data.imdbID) {
						// Delete the object from the array
						// Source: http://stackoverflow.com/questions/5767325/remove-a-particular-element-from-an-array-in-javascript
						var remove = watchlist.watchlist[i];
						var index = watchlist.watchlist.indexOf(remove);
						if (index > -1) {
						    watchlist.watchlist.splice(index, 1);
						};
					};
				};
			};

			// Put the object in local storage
			localStorage.setItem('watchlist', JSON.stringify(watchlist.watchlist));

			// Render the watchlist
			watchlist.render();
		},
		checkSync: function() {
			// Uncheck all checkboxes
			var uncheck = document.querySelectorAll('input[type="checkbox"]');
			for (var j = 0; j < uncheck.length; j++) {
				uncheck[j].checked = false;
			};

			// Check all checkboxes of the movies that are in the watchlist array
			for (var i = 0; i < this.watchlist.length; i++) {
				var check = document.querySelectorAll('input[value='+this.watchlist[i].imdbID+']');
				for (var k = 0; k < check.length; k++) {
					check[k].checked = true;
				};
			};
		},
		render: function() {
			// Declare all functions to get data from object
			var liId = function() {return 'searchLi-'+this.imdbID}
			var href = function() {return '#detail/'+this.imdbID}
			var valueId = function() {return this.imdbID}
			var title = function() {return this.Title}
			var img = function() {return this.Poster}
			var year = function() {return this.Year}
			var checkboxId = function() {return 'checkboxWatchlist-'+this.imdbID}

			// Object to let Transparency know what values to give which element
			var directives = {
			  ahref: {href: href},
			  searchresult: {id: liId, value: valueId},
			  img: {src: img},
			  title: {text: title},
			  year: {text: year},
			  checkbox: {id: checkboxId, value: valueId},
			  label: {for: checkboxId}
			};

			// Render the watchlist
			Transparency.render(el.listWatchlist, this.watchlist, directives);

			// Link the object to the right checkbox, so we can get the object when we click it
			var results = this.watchlist;
			for (var i = 0; i < results.length; i++) {
				var data = results[i];
				el.listWatchlist.children[i].querySelector('input[type="checkbox"]').data = data;
			};

			// Now there are new checkboxes, so new click events should be made, so we fire the init function
			this.init();		
		}
	}

	app.init();
})();