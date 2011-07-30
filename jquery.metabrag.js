/*!
 * jQuery JavaScript Library Plugin: metabrag
 *
 * Copyright 2011, Mikael Brevik
 * Licensed under the GPL Version 2 licens.
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
            var $this = methods;
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
                var coderwallUsername = username;
                // Check for overwritten data attr.
                if(typeof $(this).attr("data-metabrag-coderwall-username") != "undefined") {
                    coderwallUsername = $(this).attr("data-metabrag-coderwall-username");
                }
                
                                    
                if(typeof username == "undefined" || username == "") {
                    $.error( 'No username is defined for the jquery.metabrag plugin.' );
                }
                                
                if(!!$this._settings.showGithubUserInfo) {
                    var $userWrapper = $("<div />")
                    .addClass($this._settings.userInfoBoxClass)
                    .appendTo($this._$element);
                    
                    $("<p />").addClass("ui-metabrag-loading").text(methods._settings.loadingMessage).appendTo($userWrapper);
                        
                    $this._getGithubUserInfo(username);
                }
                
                if(!!$this._settings.showGithubRepoInfo) {
                    var $repoWrapper = $("<div />")
                    .addClass($this._settings.repoInfoBoxClass)
                    .appendTo($this._$element);
                    
                    $("<p />").addClass("ui-metabrag-loading").text(methods._settings.loadingMessage).appendTo($repoWrapper);
                        
                    $this._getGithubRepoInfo(username);
                }
                
                if(!!$this._settings.showCoderwallBadges) {
                    var $badgeWrapper = $("<div />")
                    .addClass($this._settings.coderwallBadgesClass)
                    .appendTo($this._$element);
                    
                    $("<p />").addClass("ui-metabrag-loading").text(methods._settings.loadingMessage).appendTo($badgeWrapper);
                        
                    $this._getCoderwallBadges(coderwallUsername);
                }
                
            });
            return this;
            
        },
        
        refresh: function () {
            
            if(!methods._isInitialized) {
                $.error( 'Metabrag has never been initialized.' );
            }
            
            return this;
        },
                
        _insertGuthubUserInfo: function (jsonObj) {
            var $child = methods._$element.find("."+methods._settings.userInfoBoxClass);
            
            if(jsonObj.meta.status == 404) {
                // We have an error
                $child.find(".ui-metabrag-loading").fadeOut();
                $("<p />").text(methods._settings.errorMessage).appendTo($child);
                return;
            }
            
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
            
            methods._insertList($infoList, jsonObj.data, {
                public_repos: "Public repos",
                public_gists: "Public gists",
                followers: "Followers",
                following: "Following"
            });
            
            if(!!methods._settings.showExtendedInfo) {
                var $eInfoList = $("<ul />")
                .addClass("ui-metabrag-extended-infolist")
                .appendTo($child);
            
                methods._insertList($eInfoList, jsonObj.data, {
                    company: "Company",
                    type: "Type of account",
                    location: "Location",
                    blog: "Blog",
                    email: "E-mail",
                    bio: "Bio",
                    created_at: "Member since"
                });
            }
            
            $child.find(".ui-metabrag-loading").fadeOut();
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
        
        _insertGuthubRepoInfo: function (jsonObj) {
            var $child = methods._$element.find("."+methods._settings.repoInfoBoxClass);

            if(jsonObj.meta.status == 404) {
                // We have an error
                $child.find(".ui-metabrag-loading").fadeOut();
                $("<p />").text(methods._settings.errorMessage).appendTo($child);
                return;
            }
            
            
            var $repoList = $("<ul />")
            .addClass("ui-metabrag-repolist")
            .appendTo($child);
                            
            $(jsonObj.data).each(function () {
                if(!methods._settings.showForks && this.fork) {
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
                    
                methods._insertList($("<ul />"), this, {
                    forks: "Forks",
                    watchers: "Watchers"
                }).appendTo($listElement);
                    
                $("<p />")
                .append(this.description)
                .appendTo($listElement); 
                    
                $listElement.appendTo($repoList);
            });
            
            $child.find(".ui-metabrag-loading").fadeOut();
        },
        
        
        _insertCoderwallBadges: function (jsonObj) {
            var $child = methods._$element.find("."+methods._settings.coderwallBadgesClass);
            // Add short info
            var $badgeList = $("<ul />")
            .addClass("ui-metabrag-badgelist")
            .appendTo($child);

            $(jsonObj.data.badges).each(function () {
                methods._insertBadge($badgeList, this);
            });
            
            $child.find(".ui-metabrag-loading").fadeOut();
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
            $.getJSON(this._githubApiURL + username + "?callback=?", this._insertGuthubUserInfo)
            .error(function () {
                var $child = methods._$element.find("."+methods._settings.userInfoBoxClass);
                $child.find(".ui-metabrag-loading").fadeOut();
                $("<p />").text(methods._settings.errorMessage).appendTo($child);
                return;
            });
        },
        _getGithubRepoInfo: function (username) {
            $.getJSON(this._githubApiURL + username + "/repos?callback=?", this._insertGuthubRepoInfo)
            .error(function () {
                var $child = methods._$element.find("."+methods._settings.repoInfoBoxClass);
                $child.find(".ui-metabrag-loading").fadeOut();
                $("<p />").text(methods._settings.errorMessage).appendTo($child);
                return;
            });
        },
        _getCoderwallBadges: function (username) {
            $.getJSON(this._coderwallApiURL + username + ".json?callback=?", this._insertCoderwallBadges)
            .error(function () {
                console.log("her inne???");
                var $child = methods._$element.find("."+methods._settings.coderwallBadgesClass);
                $child.find(".ui-metabrag-loading").fadeOut();
                $("<p />").text(methods._settings.errorMessage).appendTo($child);
                return;
            });
        }
    };

    // Define metabrag as a part of the jQuery namespace. 
    $.fn.metabrag = function( method ) {
        
        // Allow method calls (but not prefixed by _
        if ( typeof method == "string" && method.substr(0,1) != "_" && methods[ method ] ) {
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
        username: '',
        showGithubUserInfo: true,
        showGithubRepoInfo: true,
        showCoderwallBadges: true,
        showExtendedInfo: false,
        showForks: false,
        userInfoBoxClass: "ui-metabrag-github-userbox",
        repoInfoBoxClass: "ui-metabrag-github-repobox",
        coderwallBadgesClass: "ui-metabrag-coderwall-badges",
        errorMessage: "Couldn't load developer data.",
        loadingMessage: "Loading..."
    };
  
})( jQuery );