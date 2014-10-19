//version 1.0
$(function()
{
    "use strict";


//sample url request for a playlist
//http://gdata.youtube.com/feeds/api/playlists/PLUway4xenNk7IP7vw1WL7lr-L_sP1wI1d?v=2&alt=json&max-results=10

//request to get playlists
    https://gdata.youtube.com/feeds/api/users/TheVoiceCambodia/playlists?v=2&alt=json

    var startPlaylist = "http://gdata.youtube.com/feeds/api/playlists/";
    var startChannel = "http://gdata.youtube.com/feeds/api/users/";
    var numOfVideo = "&max-results=5";
    var end = "?v=2&alt=json";

    var playlists = {
        "blindAudtion": "PLUway4xenNk6LqM5YHo1YQ8RP3N4CKxwb",
        "battleRound": "PLUway4xenNk7IP7vw1WL7lr-L_sP1wI1d",
        "liveShow": "PLUway4xenNk7siZIsAFDdC0JOkvwok7Wn"
    };
    var channel = "TheVoiceCambodia/playlists/";
    var channeltURL = startChannel + channel;

    function getPlaylistURL(id) {
        return startPlaylist + id + end;
    }

    function cleanPlaylist(title) {
        title = title.replace("The Voice Cambodia", '');
        return title.replace(/[:-]/, '');      
    }

    var playlistURL = getPlaylistURL(playlists.liveShow);

    var app = {
        init: function() {
            app.getVideo(playlistURL);


        },
        getVideo: function(playlistURL) {
            $( document ).ajaxStop(function() {
                console.log( "Triggered ajaxStop handler." );
              });
            $.mobile.loading("show");
            //console.log(playlistURL);
            //display loading gif ajax-loader.gif
            //var loading = '<img src="css/images/ajax-loader.gif" />';
            //$('#playlist').html(loading);
            $.ajax({
                url: playlistURL,
                contentType: "application/json",
                dataType: 'jsonp',
                success: function(data) {
                    var ytInfos = [];
                    var ytObj = {};
                    var playlistTitle = cleanPlaylist(data.feed.title.$t);

                    $.each(data.feed.entry, function(i, item) {
                        var title = cleanPlaylist(item['title']['$t']);
                        //console.log(title);
                        if (title !== "Private video" && title !== "Deleted video") {
                            var pubdate = item['published']['$t'];
                            var fulldate = new Date(pubdate).toLocaleDateString();
                            var thumbimg = item['media$group']['media$thumbnail'][1]['url'];

                            var vlink = item['media$group']['media$content'][0]['url'];
                            var mediaID = item.media$group.yt$videoid.$t;
                            //var ytlink = item['media$group']['media$player'][0]['url'];
                            var numviews = 0;
                            if (item.yt$statistics.viewCount) {
                                var numviews = item.yt$statistics.viewCount;
                            }
                            
                            console.log("numviews");
                            console.log(numviews);

                            //var numcomms = item['gd$comments']['gd$feedLink']['countHint'];

                            var ytInfo = {
                                "title": title,
                                "date": fulldate,
                                "thumbimg": thumbimg,
                                "link": vlink,
                                "mediaID" : mediaID,
                                "numviews": numviews
                            };
                            ytInfos.push(ytInfo);

                            ytObj["lists"] = ytInfos;
                        }
                        $.mobile.loading("hide");
                    });
                    $('#playlist').html(playlistTitle);
                    //render template
                    var source = $("#template").html();
                    var template = Handlebars.compile(source);

                    //var html = template(ytInfos);

                    $('ul.videoList').empty()
                            .append(template(ytObj));

                    //attach button more event afterward
                    var $videoList = $('ul.videoList li');
                    $videoList.slice(0, 5).show();
                    $('#more').fadeIn();
//                    console.log("test->");
//                    console.log($videoList);
                },
                error: function(e) {
                    console.log(e.message);
                    $('#playlist').append("<p>Try choose another category</p>");
                }
            });
        },
        getPlaylist: function() {
            var playlists = new Array();

            $.ajax({
                url: channeltURL,
                contentType: "application/json",
                dataType: 'jsonp',
                data: {alt: "json", playlists: "v2"},
                success: function(data2) {
                    console.log(channeltURL);
//                console.log(data2);

                    $.each(data2.feed.entry, function(i, item) {

                        var playlistTitle = item.title.$t;
                        var playlistID = item['yt$playlistId']['$t'];
                        var videoCount = item['gd$feedLink'][0]['countHint'];
                        var obj = {
                            "playlistTitle": playlistTitle,
                            "playlistID": playlistID,
                            "videoCount": videoCount
                        };
                        //console.log(obj);
                        playlists.push(obj);

                    });
                    //var a = playlists;
                    //console.log(playlists);
                    app.buildPanel(playlists);

                },
                error: function() {
                    console.log(e.message);
                }
            });
        },
        buildPanel: function(data) {
            //<li><a href="#">All videos <span class="ui-li-count">55</span></a></li>
            //'<li><a href="#'+ playlistID + '">' + playlistTitle + '<span class="ui-li-count">' + videoCount + '</span></a></li>'

            //loop through data array objects
            var line = '';
            for (var i = 0; i < data.length; i++) {
                var playlistID = data[i].playlistID;
                var playlistTitle = cleanPlaylist((data[i].playlistTitle));
                var videoCount = data[i].videoCount;
                line += '<li class="show-page-loading-msg"><a href="#' + playlistID + '">' + playlistTitle + '<span class="ui-li-count">' + videoCount + '</span></a></li>';
            }
            //append line to the panel
            $('#left-panel ul').append(line).listview("refresh");

        },
        loadMore: function() {
            $('ul.videoList li').hide();
        }
    };

    app.init();
    app.getPlaylist();

    $('ul#category').on('click', 'li', function(e) {
        //get href, call api, reload the body of page
        e.stopPropagation();
        
        var playlistID = $(this).find('a').attr('href').substring(1);
        var playlistURL = getPlaylistURL(playlistID);
        //call the api
        app.getVideo(playlistURL);
        //close the panel
        $( "#left-panel" ).panel( "close" );

    });

    $('#more').click(function() {
        var $hiddenVideo = $('ul.videoList li:hidden');

        $hiddenVideo.slice(0, 5).fadeIn();
        //hide the Show More Button
        if ($('ul.videoList li:hidden').length < 1) {
            $(this).fadeOut();
        }
    });
});