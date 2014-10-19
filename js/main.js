(function() {
    "use strict";
    //utilities methods
    function cleanPlaylist(title) {
        title = title.replace("The Voice Cambodia", '');
        return title.replace(/[:-]/, '');
    }

    var youtube = {
        init: function(config) {
            this.channelURL = config.channelURL();
            this.template = config.template;
            
            this.getVideo();


        },
        buildVideo: function() {
            var self = this;
            $.when(this.getVideo()).done(function(data) {
                self.ytVideos = $.map(data.feed.entry, function(i) {
                    return {
                        title: "title"

                    };
                });


            });
        },
        attachTemplate: function() {

        },
        getVideo: function() {
            var self = this;
            console.log(this.channelURL);
            return $.ajax({
                url: this.channelURL,
                dataType: 'jsonp',
                data: {v: "2", alt: "json"},
                success: function(data) {
                    
                    var ytInfos = [];
                    var ytObj = {};
                    $.each(data.feed.entry, function(i, item) {
                        var title = cleanPlaylist(item['title']['$t']);
                        //console.log(title);
                        if (title !== "Private video" && title !== "Deleted video") {
                            var pubdate = item['published']['$t'];
                            var fulldate = new Date(pubdate).toLocaleDateString();
                            var thumbimg = item['media$group']['media$thumbnail'][1]['url'];
                            
                            var mediaID = item.media$group.yt$videoid.$t;
                            var numviews = 0;
                            if (item.yt$statistics.viewCount) {
                                numviews = item.yt$statistics.viewCount;
                            }

                            var ytInfo = {
                                "title": title,
                                "date": fulldate,
                                "thumbimg": thumbimg,
                                "mediaID" : mediaID,
                                "numviews": numviews
                            };
                            ytInfos.push(ytInfo);
                            ytObj["lists"] = ytInfos;
                        }
                        $.mobile.loading("hide");
                    });
                    
                    
                }

            });
        }




    };

    var a = "d";

    var config = {
        chann: "TheVoiceCambodia/playlists",
        channelURL: function() {
            return "http://gdata.youtube.com/feeds/api/users/" + this.chann;
        },
        liveshow_pls: "PLUway4xenNk7siZIsAFDdC0JOkvwok7Wn",
        plsURL: "http://gdata.youtube.com/feeds/api/playlists/",
        template: $("#template").html(),
        container: $('ul.videoList')
    };

    youtube.init(config);


})();