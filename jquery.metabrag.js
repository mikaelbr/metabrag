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
    
    var MetaBrag = function (element, options) {
        console.log(element);
        
        
        console.log("Metabrag const:");
        console.log(this);
        this.init();
        
        return element;
    };
    
    var methods = {
        _$element: "",
        _settings: {},
        _isInitialized: false,
        init : function( options ) {
            $this = methods;
            $this._$element = this.addClass("ui-metabrag-content");
            $this._settings = $.extend({}, $.fn.metabrag.defaults, options);
            $this._isInitialized = true;
            $this._$element.each(function () {
                var username = $this._settings.username;
                // Check for overwritten data attr.
                if(typeof $(this).attr("data-metabrag-username") != "undefined") {
                    username = $(this).attr("data-metabrag-username");
                } 
                
                // Try for a coderwall spesific username
                var coderwallUsername =  username;
                // Check for overwritten data attr.
                if(typeof $(this).attr("data-metabrag-coderwall-username") == "undefined") {
                    coderWallUsername = $(this).attr("data-metabrag-coderwall-username");
                }
                
                                    
                if(typeof username == "undefined" || username == "") {
                    $.error( 'No username is defined for the jquery.metabrag plugin.' );
                }
                                
                if(!!$this._settings.showGithubUserInfo) {
                    $("<div />")
                    .addClass($this._settings.userInfoBoxClass)
                    .appendTo($this._$element);
                        
                    $this._getGithubUserInfo(username);
                }
                
                if(!!$this._settings.showGithubRepoInfo) {
                    $("<div />")
                    .addClass($this._settings.repoInfoBoxClass)
                    .appendTo($this._$element);
                        
                    $this._getGithubRepoInfo(username);
                }
                
                if(!!$this._settings.showCoderwallBadges) {
                    $("<div />")
                    .addClass($this._settings.coderwallBadgesClass)
                    .appendTo($this._$element);
                        
                    $this._getCoderwallBadges(coderwallUsername);
                }
            //                console.log("end of init")
            });
            
        },
        
        refresh: function () {
            
            if(!methods._isInitialized) {
                $.error( 'Metabrag has never been initialized.' );
            }
            
        },
                
        _insertGuthubUserInfo: function (jsonObj) {
            var $child = methods._$element.find("."+$this._settings.userInfoBoxClass);
            
            // Add avatar
            var $avatarBox = $("<div />")
            .addClass("ui-metabrag-avatar")
            .appendTo($child);
            
            $("<img />")
            .attr("src", jsonObj.data.avatar_url)
            .attr("alt", jsonObj.data.name)
            .appendTo($avatarBox);
                
            // Add title 
            $("<a />")
            .attr("href", jsonObj.data.html_url)
            .html(jsonObj.data.name)
            .append($("<span />").html(jsonObj.data.login))
            .wrap("<h2 />")
            .parent()
            .appendTo($child);
                
            // Add short info
            var $infoList = $("<ul />")
            .addClass("ui-metabrag-infolist")
            .appendTo($child);
            
            methods._insertList($infoList, jsonObj, {
                public_repos: "Public repos",
                public_gists: "Public gists",
                followers: "Followers",
                following: "Following"
            });
                
            var $eInfoList = $("<ul />")
            .addClass("ui-metabrag-extended-infolist")
            .appendTo($child);
            
            methods._insertList($eInfoList, jsonObj, {
                company: "Company",
                type: "Type of account",
                location: "Location",
                blog: "Blog",
                email: "E-mail",
                bio: "Bio",
                created_at: "Member since"
            });
            
            console.log("------ Github UserInfo -------");
            console.log(jsonObj);            
            console.log("----  // Github UserInfo -----");
        },
        
        _insertList: function (element, data, fields) {
            for(o in fields) {
                if(data.data[o] && data.data[o] != "") {
                    $("<li />").append("<span>"+fields[o]+":</span> ")
                    .append(data.data[o])
                    .appendTo(element);
                }
            }
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
        //$.getJSON(this._githubApiURL + username + "/repos?callback=?", this._insertGuthubRepoInfo);
        },
        _getCoderwallBadges: function (username) {
        //$.getJSON(this._coderwallApiURL + username + ".json?callback=?", this._insertCoderwallBadges);
        }
    };

    // Define metabrag as a part of the jQuery namespace. 
    $.fn.metabrag = function( method ) {
        
        // Allow method calls (but not prefixed by _
        if ( typeof method != "undefined" && method.substr(0,1) != "_" && methods[ method ] ) {
            return methods[method].apply(this, Array.prototype.slice.call( arguments, 1 ));
        } 
        // If argument is object or not set, init plugin.
        else if ( typeof method === 'object' || ! method ) {
            return methods.init.apply( this, arguments );
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
        showForks: true,
        userInfoBoxClass: "ui-metabrag-github-userbox",
        repoInfoBoxClass: "ui-metabrag-github-repobox",
        coderwallBadgesClass: "ui-metabrag-coderwall-badges"
    };
  
})( jQuery );