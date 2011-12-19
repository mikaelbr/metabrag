/*!
 * jQuery JavaScript Library Plugin: metabrag
 *
 * Copyright 2011, Mikael Brevik
 * Licensed under the GPL Version 2 licens.
 *
 * Date: Thu Jul 29 21:48:21 2011 +0100
 */
(function( $ ){

    var methods = {

            init : function( options ) {

                return this.each(function(){

                    var $this = $(this),
                     data = $this.data('metabrag');

                    // If the plugin hasn't been initialized yet
                    if (!data ) {

                        $this.addClass("ui-metabrag-content");

                        $(this).data('metabrag', {
                           target : $this,
                           _settings : $.extend({}, $.fn.metabrag.defaults, options)
                        });

                        methods.refresh.apply( this, [] );
                    }
                });
            },

            refresh: function () {

                var $this = $(this),
                     data = $this.data('metabrag');

                if(!data) {
                    $.error( 'Metabrag has never been initialized.' );
                }

                var username = data._settings.username;

                $this.empty();

                // Check for overwritten data attr.
                if(typeof $this.attr("data-metabrag-username") !== "undefined") {
                    username = $this.attr("data-metabrag-username");
                } else {
                    $this.attr("data-metabrag-username", username);
                }

                // Try for a coderwall spesific username
                var coderwallUsername = username;
                if(data._settings.coderwallUsername != "") {
                    coderwallUsername = data._settings.coderwallUsername;
                }

                // Check for overwritten data attr.
                if(typeof $this.attr("data-metabrag-coderwall-username") !== "undefined") {
                    coderwallUsername = $this.attr("data-metabrag-coderwall-username");
                } else {
                    $this.attr("data-metabrag-coderwall-username", coderwallUsername);
                }

                if(typeof username === "undefined" || username == "") {
                    $.error( 'No username is defined for the jquery.metabrag plugin.' );
                }

                if(!!data._settings.showGithubUserInfo) {
                    var $userWrapper = $("<div />")
                    .addClass(data._settings.userInfoBoxClass)
                    .appendTo(this);

                    $("<p />").addClass("ui-metabrag-loading").html(data._settings.loadingMessage).appendTo($userWrapper);
                    // $this._getGithubUserInfo(username);
                    methods._getGithubUserInfo.apply( this, [username] );
                }

                if(!!data._settings.showGithubRepoInfo) {
                    var $repoWrapper = $("<div />")
                    .addClass(data._settings.repoInfoBoxClass)
                    .appendTo(this);

                    $("<p />").addClass("ui-metabrag-loading").html(data._settings.loadingMessage).appendTo($repoWrapper);

                    //$this._getGithubRepoInfo(username);
                    methods._getGithubRepoInfo.apply( this, [username] );
                }

                if(!!data._settings.showCoderwallBadges) {
                    var $badgeWrapper = $("<div />")
                    .addClass(data._settings.coderwallBadgesClass)
                    .appendTo(this);

                    $("<p />").addClass("ui-metabrag-loading").html(data._settings.loadingMessage).appendTo($badgeWrapper);

                    // $this._getCoderwallBadges(coderwallUsername);
                    methods._getCoderwallBadges.apply( this, [coderwallUsername] );
                }

                return this;
            },

            _insertGithubUserInfo: function (jsonObj, username) {

                var $this = $(this),
                     data = $this.data('metabrag');

                var $child = $this.closest("[data-metabrag-username='"+username+"']").find("."+data._settings.userInfoBoxClass);
                if(jsonObj.meta.status == 404) {
                    // We have an error
                    $child.find(".ui-metabrag-loading").fadeOut("normal", function () {
                        $(this).remove();
                    });
                    $("<p />").text(data._settings.errorMessage).appendTo($child);
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
                .attr({"src": jsonObj.data.avatar_url,
                    "alt": jsonObj.data.name})
                .appendTo($avatarBox);

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

                if(!!data._settings.showExtendedInfo) {
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

                $child.find(".ui-metabrag-loading").fadeOut("normal", function () {
                    $(this).remove();
                });
                $child.trigger(data._settings.eventLoadedGithubUserInfo, [jsonObj, username]);

            },

            _insertList: function (element, data, fields) {
                for(field in fields) {
                    // Drop showing empty string properties.
                    if(typeof data[field] == "string" && data[field] == "" || data[field] == null) {
                        continue;
                    }
                    $("<li />").append("<span>"+fields[field]+":</span> ")
                    .append(data[field])
                    .appendTo(element);
                }
                return element;
            },

            _insertGithubRepoInfo: function (jsonObj, username) {

                var $this = $(this),
                     data = $this.data('metabrag');

                var $child = $this.closest("[data-metabrag-username='"+username+"']").find("."+data._settings.repoInfoBoxClass);

                if(jsonObj.meta.status == 404) {
                    // We have an error
                    $child.find(".ui-metabrag-loading").fadeOut("normal", function () {
                        $(this).remove();
                    });
                    $("<p />").text(data._settings.errorMessage).appendTo($child);
                    return this;
                }

                var $repoList = $("<ul />")
                .addClass("ui-metabrag-repolist")
                .appendTo($child);

                $(jsonObj.data).each(function () {
                    if(!data._settings.showForks && this.fork) {
                        return;
                    }
                    $listElement = $("<li />");

                    $("<a />")
                    .attr({"href": this.html_url,
                        "title": this.name})
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

                $child.find(".ui-metabrag-loading").fadeOut("normal", function () {
                    $(this).remove();
                });
                $child.trigger(data._settings.eventLoadedGithubRepoInfo, [jsonObj, username]);
            },


            _insertCoderwallBadges: function (jsonObj, username) {

                var $this = $(this),
                     data = $this.data('metabrag');

                var $child = $(this).closest("[data-metabrag-coderwall-username='"+username+"']").find("."+data._settings.coderwallBadgesClass);
                // Add short info
                var $badgeList = $("<ul />")
                .addClass("ui-metabrag-badgelist")
                .appendTo($child);

                $(jsonObj.data.badges).each(function () {
                    methods._insertBadge($badgeList, this);
                });

                $child.find(".ui-metabrag-loading").fadeOut("normal", function () {
                    $(this).remove();
                });
                $child.trigger(data._settings.eventLoadedCoderwallBadges, [jsonObj, username]);
            },

            _insertBadge: function (element, data) {
                var $imgElm = $("<img />")
                .attr({"src": data.badge,
                    "alt": data.name,
                    "title": data.name + ": " + data.description
                });

                $("<li />").append($imgElm).appendTo(element);
            },

            _githubApiURL: "https://api.github.com/users/",
            _coderwallApiURL: "http://coderwall.com/",
            _getGithubUserInfo: function (username) {
                var $this = $(this),
                     data = $this.data('metabrag');

                $.getJSON(methods._githubApiURL + username + "?callback=?", function (data) {
                    // $this._insertGithubUserInfo(data, username);
                    methods._insertGithubUserInfo.apply( $this, [data, username] );
                })
                .error(function () {
                    var $child = this.find("."+data._settings.userInfoBoxClass);
                    $child.find(".ui-metabrag-loading").fadeOut();
                    $("<p />").text(data._settings.errorMessage).appendTo($child);
                    return;
                });
            },
            _getGithubRepoInfo: function (username) {
                var $this = $(this),
                     data = $this.data('metabrag');


                $.getJSON(methods._githubApiURL + username + "/repos?callback=?", function(data) {
                    // $this._insertGithubRepoInfo(data, username);
                    methods._insertGithubRepoInfo.apply( $this, [data, username] );
                })
                .error(function () {
                    var $child = this.find("."+data._settings.repoInfoBoxClass);
                    $child.find(".ui-metabrag-loading").fadeOut();
                    $("<p />").text(data._settings.errorMessage).appendTo($child);
                    return;
                });
            },
            _getCoderwallBadges: function (username) {
                var $this = $(this),
                     data = $this.data('metabrag');

                $.getJSON(methods._coderwallApiURL + username + ".json?callback=?", function(data) {
                    // $this._insertCoderwallBadges(data, username);
                    methods._insertCoderwallBadges.apply( $this, [data, username] );
                })
                .error(function () {
                    var $child = this.find("."+data._settings.coderwallBadgesClass);
                    $child.find(".ui-metabrag-loading").fadeOut();
                    $("<p />").text(data._settings.errorMessage).appendTo($child);
                    return;
                });
            }
        };

    // Define metabrag as a part of the jQuery namespace.
    $.fn.metabrag = function( method ) {

        // Allow method calls (but not prefixed by _
        if ( typeof method == "string" && method.substr(0,1) != "_" && methods[ method ] ) {
            return methods[method].call(this, Array.prototype.slice.call( arguments, 1 ));
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
