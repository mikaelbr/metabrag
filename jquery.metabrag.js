/*!
 * jQuery JavaScript Library Plugin: metabrag
 *
 * Copyright 2011, Mikael Brevik
 * Licensed under the GPL Version 2 licens.
 *
 *
 * Date: Thu Jul 29 21:48:21 2011 +0100
 */
(function( $ ){

    var metabragMethods = {
        init : function( options ) { 
            // get settings..
            var $this = metabragMethods;
            var $element = this;
            $this._settings = $.extend({}, $.fn.metabrag.defaults, options);
            
            $element.each(function () {
                var username = $this._settings.username != "" ? $this._settings.username : $(this).attr("data-metabrag-username");
                                    
                if(typeof username == "undefined" || username == "") {
                    $.error( 'No username is defined for the jquery.metabrag plugin.' );
                }
                
                console.log()
                
                if(!!$this._settings.showGithubUserInfo) {
                    $this._getGithubUserInfo(username);
                }
                
                if(!!$this._settings.showGithubRepoInfo) {
                    $this._getGithubRepoInfo(username);
                }
                
                if(!!$this._settings.showCoderwallBadges) {
                    $this._getCoderwallBadges(username);
                }
        
            });
            
        },
        
        refresh: function () {
            
        },
                
        _insertGuthubUserInfo: function (jsonObj) {
            console.log("------ Github UserInfo -------");
            console.log(jsonObj);            
            console.log("----  // Github UserInfo -----");
        },
        
        _insertGuthubRepoInfo: function (jsonObj) {
            console.log("------ Github Repos Info -------");
            console.log(jsonObj);
            console.log("----  // Github Repos Info -----");
        },
        
        
        _insertCoderwallBadges: function (jsonObj) {
            console.log("------ Coderwall UserInfo -------");
            console.log(jsonObj);
            console.log("----  // Coderwall UserInfo -----");
        },
        
        _githubApiURL: "https://api.github.com/users/",
        _coderwallApiURL: "http://coderwall.com/",
        _getGithubUserInfo: function (username) {
            $.getJSON(this._githubApiURL + username + "?callback=?", this._insertGuthubUserInfo);
        },
        _getGithubRepoInfo: function (username) {
            $.getJSON(this._githubApiURL + username + "/repos?callback=?", this._insertGuthubUserInfo);
        },
        _getCoderwallBadges: function (username) {
            $.getJSON(this._coderwallApiURL + username + ".json?callback=?", this._insertGuthubUserInfo);
        }
    };


    // Define metabrag as a part of the jQuery namespace. 
    $.fn.metabrag = function( method ) {
        
        // Allow method calls (but not prefixed by _
        if ( metabragMethods[method] && method.substr(0,1) != "_") {
            return metabragMethods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
        } 
        // If argument is object or not set, init plugin.
        else if ( typeof method === 'object' || ! method ) {
            return metabragMethods.init.apply( this, arguments );
        } 
        // No method found by argument input. Could be a private method.
        else {
            $.error( 'Method ' +  method + ' does not exist on jQuery.metabrag' );
            return this;
        }    
  
    };
  
    $.fn.metabrag.defaults = {
        useDataAttr: true,
        username: '',
        showGithubUserInfo: true,
        showGithubRepoInfo: true,
        showCoderwallBadges: true,
        showForks: true
    };
  
})( jQuery );