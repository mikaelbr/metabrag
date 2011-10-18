/*!
 * jQuery JavaScript Library Plugin: metabrag
 *
 * Copyright 2011, Mikael Brevik
 * Licensed under the GPL Version 2 licens.
 *
 * Date: Thu Jul 29 21:48:21 2011 +0100
 */
(function( $ ){
    
    

    // Define metabrag as a part of the jQuery namespace. 
    $.fn.metabrag = function( method ) {
        var $that = this;
        this.methods = {
            _$element: "",
            _settings: {},
            _isInitialized: false,
            init : function( options ) {
                var $this = $that.methods;
                $this._$element = this.addClass("ui-metabrag-content");
                $this._settings = $.extend({}, $.fn.metabrag.defaults, options);
                $this._isInitialized = true;

                $this.refresh();
                    
                return this;
                
            },
            
            refresh: function () {
                
                if(!this._isInitialized) {
                    $.error( 'Metabrag has never been initialized.' );
                }

                var $this = this;

                console.log("her");
                console.log(this);

                $this._$element.each(function () {
                    console.log(this);
                    var username = $this._settings.username;
                    
                    $(this).empty();

                    // Check for overwritten data attr.
                    if(typeof $(this).attr("data-metabrag-username") != "undefined") {
                        username = $(this).attr("data-metabrag-username");
                    } else {
                        $(this).attr("data-metabrag-username", username);
                    } 
                    
                    // Try for a coderwall spesific username
                    var coderwallUsername = username;
                    if($this._settings.coderwallUsername != "") {
                        coderwallUsername = $this._settings.coderwallUsername;
                    }
                    // Check for overwritten data attr.
                    if(typeof $(this).attr("data-metabrag-coderwall-username") != "undefined") {
                        coderwallUsername = $(this).attr("data-metabrag-coderwall-username");
                    } else {
                        $(this).attr("data-metabrag-coderwall-username", coderwallUsername);
                    }
                    
                                        
                    if(typeof username == "undefined" || username == "") {
                        $.error( 'No username is defined for the jquery.metabrag plugin.' );
                    }
                                    
                    if(!!$this._settings.showGithubUserInfo) {
                        var $userWrapper = $("<div />")
                        .addClass($this._settings.userInfoBoxClass)
                        .appendTo(this);
                        
                        $("<p />").addClass("ui-metabrag-loading").html($this._settings.loadingMessage).appendTo($userWrapper);
                        $this._getGithubUserInfo(username);
                    }
                    
                    if(!!$this._settings.showGithubRepoInfo) {
                        var $repoWrapper = $("<div />")
                        .addClass($this._settings.repoInfoBoxClass)
                        .appendTo(this);
                        
                        $("<p />").addClass("ui-metabrag-loading").html($this._settings.loadingMessage).appendTo($repoWrapper);
                            
                        $this._getGithubRepoInfo(username);
                    }
                    
                    if(!!$this._settings.showCoderwallBadges) {
                        var $badgeWrapper = $("<div />")
                        .addClass($this._settings.coderwallBadgesClass)
                        .appendTo(this);
                        
                        $("<p />").addClass("ui-metabrag-loading").html($this._settings.loadingMessage).appendTo($badgeWrapper);
                            
                        $this._getCoderwallBadges(coderwallUsername);
                    }
                });
                
                return this;
            },
                    
            _insertGithubUserInfo: function (jsonObj, username) {
                var $child = $(this._$element).closest("[data-metabrag-username='"+username+"']").find("."+this._settings.userInfoBoxClass);
                if(jsonObj.meta.status == 404) {
                    // We have an error
                    $child.find(".ui-metabrag-loading").fadeOut("normal", function () {
                        $(this).remove();
                    });
                    $("<p />").text(this._settings.errorMessage).appendTo($child);
                    return;
                }
                    
                // Add title 
                $("<a />")
                .attr("href", jsonObj.data.html_url)
                .html(jsonObj.data.name)
                .append($("<span />").html(jsonObj.data.login))
                .wrap("<h2 />")
                .parent()
                .appendTo($child);
                
                // Add avatar
                var $avatarBox = $("<div />")
                .addClass("ui-metabrag-avatar")
                .appendTo($child);
                
                $("<img />")
                .attr("src", jsonObj.data.avatar_url)
                .attr("alt", jsonObj.data.name)
                .appendTo($avatarBox);
                    
                // Add short info
                var $infoList = $("<ul />")
                .addClass("ui-metabrag-infolist")
                .appendTo($child);
                
                this._insertList($infoList, jsonObj.data, {
                    public_repos: "Public repos",
                    public_gists: "Public gists",
                    followers: "Followers",
                    following: "Following"
                });
                
                if(!!this._settings.showExtendedInfo) {
                    var $eInfoList = $("<ul />")
                    .addClass("ui-metabrag-extended-infolist")
                    .appendTo($child);
                
                    this._insertList($eInfoList, jsonObj.data, {
                        company: "Company",
                        type: "Type of account",
                        location: "Location",
                        blog: "Blog",
                        email: "E-mail",
                        bio: "Bio",
                        created_at: "Member since"
                    });
                }
                
                $child.find(".ui-metabrag-loading").fadeOut("normal", function () {
                    $(this).remove();
                });
                $child.trigger(this._settings.eventLoadedGithubUserInfo, [jsonObj, username]);

            },
            
            _insertList: function (element, data, fields) {
                for(o in fields) {
                    // Drop showing empty string properties.
                    if(typeof data[o] == "string" && data[o] == "" || data[o] == null) {
                        continue;
                    }
                    $("<li />").append("<span>"+fields[o]+":</span> ")
                    .append(data[o])
                    .appendTo(element);
                }
                return element;
            },
            
            _insertGithubRepoInfo: function (jsonObj, username) {
                var $child = $(this._$element).closest("[data-metabrag-username='"+username+"']").find("."+this._settings.repoInfoBoxClass);
      
                if(jsonObj.meta.status == 404) {
                    // We have an error
                    $child.find(".ui-metabrag-loading").fadeOut("normal", function () {
                        $(this).remove();
                    });
                    $("<p />").text(this._settings.errorMessage).appendTo($child);
                    return;
                }
                
                var $repoList = $("<ul />")
                .addClass("ui-metabrag-repolist")
                .appendTo($child);
                

                var $this = this;
                $(jsonObj.data).each(function () {
                    if(!$this._settings.showForks && this.fork) {
                        return;
                    }
                    $listElement = $("<li />");
                    
                    $("<a />")
                    .attr("href", this.html_url)
                    .attr("title", this.name)
                    .text(this.name)
                    .wrap("<h3>")
                    .parent()
                    .appendTo($listElement);
                        
                    $this._insertList($("<ul />"), this, {
                        forks: "Forks",
                        watchers: "Watchers"
                    }).appendTo($listElement);
                        
                    $("<p />")
                    .append(this.description)
                    .appendTo($listElement); 
                        
                    $listElement.appendTo($repoList);
                });
                
                $child.find(".ui-metabrag-loading").fadeOut("normal", function () {
                    $(this).remove();
                });
                $child.trigger(this._settings.eventLoadedGithubRepoInfo, [jsonObj, username]);
            },
            
            
            _insertCoderwallBadges: function (jsonObj, username) {
                var $child = $(this._$element).closest("[data-metabrag-coderwall-username='"+username+"']").find("."+this._settings.coderwallBadgesClass);
                // Add short info
                var $badgeList = $("<ul />")
                .addClass("ui-metabrag-badgelist")
                .appendTo($child);

                var $this = this;

                $(jsonObj.data.badges).each(function () {
                    $this._insertBadge($badgeList, this);
                });
                
                $child.find(".ui-metabrag-loading").fadeOut("normal", function () {
                    $(this).remove();
                });
                $child.trigger(this._settings.eventLoadedCoderwallBadges, [jsonObj, username]);
            },
            
            _insertBadge: function (element, data) {
                var $imgElm = $("<img />")
                .attr("src", data.badge)
                .attr("alt", data.name)
                .attr("title", data.name + ": " + data.description);
                    
                $("<li />").append($imgElm).appendTo(element);
            },
            
            _githubApiURL: "https://api.github.com/users/",
            _coderwallApiURL: "http://coderwall.com/",
            _getGithubUserInfo: function (username) {
                var $this = this;
                $.getJSON(this._githubApiURL + username + "?callback=?", function (data) {
                    $this._insertGithubUserInfo(data, username);
                })
                .error(function () {
                    var $child = $this._$element.find("."+$this._settings.userInfoBoxClass);
                    $child.find(".ui-metabrag-loading").fadeOut();
                    $("<p />").text($this._settings.errorMessage).appendTo($child);
                    return;
                });
            },
            _getGithubRepoInfo: function (username) {
                var $this = this;
                $.getJSON($this._githubApiURL + username + "/repos?callback=?", function(data) {
                    $this._insertGithubRepoInfo(data, username);
                })
                .error(function () {
                    var $child = $this._$element.find("."+$this._settings.repoInfoBoxClass);
                    $child.find(".ui-metabrag-loading").fadeOut();
                    $("<p />").text($this._settings.errorMessage).appendTo($child);
                    return;
                });
            },
            _getCoderwallBadges: function (username) {
                var $this = this;
                $.getJSON(this._coderwallApiURL + username + ".json?callback=?", function(data) {
                    $this._insertCoderwallBadges(data, username);
                })
                .error(function () {
                    var $child = $this._$element.find("."+$this._settings.coderwallBadgesClass);
                    $child.find(".ui-metabrag-loading").fadeOut();
                    $("<p />").text($this._settings.errorMessage).appendTo($child);
                    return;
                });
            }
        };
        
        // Allow method calls (but not prefixed by _
        if ( typeof method == "string" && method.substr(0,1) != "_" && methods[ method ] ) {
            return this.methods[method].apply(this, Array.prototype.slice.call( arguments, 1 ));
        } 
        // If argument is object or not set, init plugin.
        else if ( typeof method === 'object' || ! method ) {
            return this.methods.init.apply( this, arguments );
        } 
        // No method found by argument input. Could be a private method.
        else {
            $.error( 'Method ' +  method + ' does not exist on jQuery.metabrag' );
            return this;
        }
  
    };
  
    $.fn.metabrag.defaults = {
        username: '', // Global username - if only one username is supported.
        coderwallUsername: '', // Global coderwall username
        showGithubUserInfo: true, // Shows/hides the github user info box
        showGithubRepoInfo: true, // Shows/hides the github repo info box
        showCoderwallBadges: true, // Shows/hides coderwall badges
        showExtendedInfo: false, // Shows/hides extended info in github user info box
        showForks: false, // Shows/hides forks in repo info box
        userInfoBoxClass: "ui-metabrag-github-userbox", // class for styling user info box
        repoInfoBoxClass: "ui-metabrag-github-repobox", // class for styling repo info box
        coderwallBadgesClass: "ui-metabrag-coderwall-badges", // class for styling coderwall badges
        errorMessage: "Couldn't load developer data.", // error message on 404
        loadingMessage: "Loading...", // String for loading text.
        eventLoadedGithubUserInfo: "userinfoLoaded.metabrag", // Event triggered when a user box is loaded
        eventLoadedGithubRepoInfo: "repoinfoLoaded.metabrag", // Event triggered when a repo box is loaded
        eventLoadedCoderwallBadges: "badgesLoaded.metabrag" // Event triggered when badges are loaded
    };
  
})( jQuery );
