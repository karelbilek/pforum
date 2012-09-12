	$(function()
	{
		$('.scroll-pane').jScrollPane({ autoReinitialise: true });
	});
	
	function downloadAndDo(url, func) {
	    
	    var httpRequest = new XMLHttpRequest();
	    
	    function check(){
	        if (httpRequest.readyState === 4) {
                  if (httpRequest.status === 200) {
                    func(httpRequest.responseText);
                  } else {
                    alert('Problem s requestem do '+url);
                  }
                }
	    }
	    
	    httpRequest.onreadystatechange = check;
        httpRequest.open('GET', url);
        httpRequest.send();
	}
	
	function loadThreads(newposts) {
	    
	    
	    var mess = /<div class="forumbg">[\s\S]*<ul class="topiclist topics">([\s\S]*?)<span class="corners-bottom">/.exec(newposts)[1];
	    var topicregex = /viewtopic\.php\?f=\d+&amp;t=(\d+)" class="topictitle">([\s\S]*?)<\/a>[\s\S]*?viewforum\.php\?f=\d*">([^<]*)</g;
	    var article_arr = topicregex.exec(mess);
	    var res = new Array();
	    while (article_arr) {
	        var url = article_arr[1];
	        var name = article_arr[2];
	        var klubik = article_arr[3];
	        var article= new Array();
	        article["id"] = url;
	        article["name"] = name;
	        article["klubik"] = klubik;
	        
	        res.push(article);
	        
            article_arr = topicregex.exec(mess);
	    }
	    return res;
	}
	
	function defuscate(element){
            var text= [];
            for (var i= 0, n= element.childNodes.length; i<n; i++) {
                var child= element.childNodes[i];
                if (child.nodeType===1 && child.tagName.toLowerCase()!=='script' && child.tagName.toLowerCase()!=='blockquote')
                    text.push(defuscate(child));
                else if (child.nodeType===3)
                    text.push(child.data);
            }
                        
            var ret= text.join(' ');
            ret = ret.replace(/https?:\/\/\S*(\s|$)/g, "");
	        ret = ret.replace(/viewtopic\.php\?\S+(\s|$)/g, "");
	        var retArr = ret.split(/[!"#$%&'()*+,\-.\/:;<=>?@[\\\]^_`\{\|\}~\s]+/);
	        retArr = retArr.filter(function(s){return !(s.match(/^[\s\d]*$/));})
	        retArr = retArr.map(function(s){return s.toLowerCase();});
            return retArr;
	}
	
	var all_threads_data = new Object();
	
	function loadThreadsToTable(newposts) {
	    var articles = loadThreads(newposts);
	    var table = document.getElementById("tabulkavlevo");
	    
	    for (article_index in articles) {
	        var article = articles[article_index];
	        
	        
	        table.insertAdjacentHTML("beforeend","<tr> <td id=\"vedlejsitable"+article["id"]+"\" style=\"color:gray\"></td><td id=\"thrtable"+article["id"]+"\" class=\"thrtable\"> <div style=\"font-size:10px; font-weight:bold; font-family:Arial;\">"+article["klubik"]+"</div>  <a id=\"link"+article["id"]+"\">"+article["name"]+"</td> </tr>");
	        
	        var nechapu = article["id"];
	        
	        document.getElementById("link"+article["id"]).addEventListener('click', function(click){
	                
	                var cele = click.target.id;
	                var id = cele.substr(4);
	                putThreadToRight(id);
	                
	        });
	        
	        if (article["id"] != 1786) {
	            loadThreadBodies(article["id"]);
	        }
	    }
	    
	}
	
	function putThreadToRight(id) {
	    var todelete = document.getElementById("todelete");
	    var otecko = todelete.parentNode;
        
	    otecko.removeChild(todelete);
	    
	    var newdiv = document.createElement('div');
	    newdiv.setAttribute('id','todelete');
	    
	    var vpstring = "";
	    
	    var all_data = all_threads_data[id];
	    
	    vpstring="<table class=\"table table-striped\"> <tbody>";
	    
	    for (body_index in all_data) {
	          	    
	        var body = all_threads_data[id][body_index]["real_cont"];
	        var profil = all_threads_data[id][body_index]["profil"];
	        vpstring += "<tr>"
	        
	        var ikonkaMatch = profil.innerHTML.match(/\.\/download\/file\.php\?avatar=([^\.]*\.[^"]*)"/);
	        
	        var ikonkafile;
	        
	        if (ikonkaMatch) {
	            ikonkafile = "http://forum.pirati.cz/download/file.php?avatar="+ikonkaMatch[1];
	        } else {
	            ikonkafile = "http://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Piratpartiet.svg/60px-Piratpartiet.svg.png"
	        }
	        
	        var safe = profil.innerHTML;
	        safe = safe.replace(/<dd><strong>Příspěvky[\s\S]*$/,"");
	        safe = safe.replace(/</g, "&lt;");
	        safe = safe.replace(/>/g, "&gt;");
	        safe = safe.replace(/000000/g, "FFFFFF");
	        
	        safe = safe.replace(/\.\/download\/file/g, "http://forum.pirati.cz/download/file");
	        safe = safe.replace(/"/g, "'");
	        	        
	        var placement;
	        if (body_index >= all_data.length-4 && body_index>3) {
	            placement="top";
	        } else {
	            placement="bottom";
	        }
	        
	        var srdicko="";
	        if ( all_threads_data[id][body_index]["score"]) {
	            srdicko = "<br><br>&#x2665;"
	            
	            var srd_match = all_threads_data[id][body_index]["score"].innerHTML.match(/\s(\d+)%/);
	            
	            srdicko += srd_match[1];
	        }
	        
	        
	        vpstring += "<td><img src=\""+ikonkafile+"\" style=\"max-width:30px\" id=\"ttip"+body_index+"\" rel=\"tooltip\" data-placement=\""+placement+"\" data-original-title=\""+safe+"\">"+srdicko+"</td>";
	        
            
	        
	        vpstring += "<td>"
	        
	        vpstring += body.innerHTML.replace(/\.\/images/g, "http://forum.pirati.cz/images");
	        vpstring += "</td>";
	        vpstring += "</tr>";
	    }
	    
	    vpstring += "</tbody></table>";
	    
	        
	    newdiv.insertAdjacentHTML("beforeend", vpstring);
	    otecko.appendChild(newdiv);
        
        //tohle je trochu stupidni, ale moc nevim, co dalsiho s tim
        for (body_index in all_data) {
            $('#ttip'+body_index).tooltip();
        }
        
	    
	}
	
	function loadThreadTFIDF(id, bodies) {
	    var wordcounts=new Object();
	    all_threads_data[id]=bodies;
	    for (body_index in bodies) {
	        var body = bodies[body_index]["real_cont"];
	        var words = defuscate(body);
	        
	        for (word in words) {
	            if (!wordcounts[words[word]]) {
	                wordcounts[words[word]] = 0;
	            }
	            wordcounts[words[word]] = wordcounts[words[word]] + 1;
	            
	        }
	        
	        
	        //alert(bodies[body_index]);
	    }
	    var tfidfs = new Array();
        for (word in wordcounts) {
            var tf = wordcounts[word];
            var idf_c = idf_json[word];
            if (!idf_c) {
                idf_c = 1;
            }
            var idf = Math.log(4335/idf_c);
            var tfidf = tf*idf;
            tfidfs.push ([word, tfidf]);
	        
        }
        tfidfs.sort(function(a, b) {return b[1] - a[1]})
        var res = new Array()
        var ress = "";
        for (var i=0; i<6; i++) {
            res.push(tfidfs[i][0]);
            if (i!=0) {
                ress = ress +" ";
            }
            ress = ress + tfidfs[i][0];
        }
        
        
        var td = document.getElementById("thrtable"+id);
        
        td.insertAdjacentHTML("beforeend", "<br><div style=\"font-size:10px; font-style: italic; font-family:Arial;\">"+ress+"</div>");
        
        
        var size = bodies.length;
        var bettersize = bodies.filter(function(b){if(b["plusiky"]){return true} else {return false}}).length;
        
        var vedlejsitd =  document.getElementById("vedlejsitable"+id);
        
        var sizestring = size;
        if (bettersize > 0) {
            sizestring += "<br><small><small>&#x2665;"+bettersize+"</small></small>"
        }
        
        vedlejsitd.insertAdjacentHTML("beforeend", sizestring);
        
        //return res;
	}
	
	function loadThreadBodies(id) {
	    //this is a little stupid
	    downloadAndDo("https://forum.pirati.cz/viewtopic.php?t="+id, function(text){
	        var num = /Stránka <strong>1<\/strong> z <strong>(\d+)<\/strong>/.exec(text)[1];
	        var bodies = parseArticlesFromHTML(text);
	        if (num > 1) {
	            i=1;
	            function do_again() {
        	       
                    downloadAndDo("https://forum.pirati.cz/viewtopic.php?t="+id+"&start="+(i*10), function(text) {
                        bodies = bodies.concat(parseArticlesFromHTML(text));
                        if (i<num-1) {
                            i++;
                            do_again();
                        } else {
                            loadThreadTFIDF(id, bodies);
                        }
                    });
	            }
	            
	            do_again();
	            
	            
	        } else {
	            //TODO: vše
                loadThreadTFIDF(id, bodies);
	        }
	        
	        
	    });
	}
	
	function parseArticlesFromHTML(html) {
	    var threadDoc = document.implementation.createHTMLDocument("");
        threadDoc.body.innerHTML = html;
        
        var articles = threadDoc.getElementsByClassName('post');
        
        var good_articles = new Array();
        
        for (var i = 0; i < articles.length; ++i) {
          var article = articles[i];
          if (article.id && article.id.substring(0,1)=="p"){
              good_articles.push(article);
          }
        }
        
        var res = new Array();
        for (article_id in good_articles) {
            var article = good_articles[article_id];
            var contents = article.getElementsByClassName("content");
            
            var articleRes = new Array();
            articleRes["real_cont"] = contents[0];
            
            
            if (contents.length > 1) {
                articleRes["plusiky"] = contents[1];
                articleRes["score"] = contents[2];
            }
            articleRes["cas"] = article.getElementsByClassName("author")[0];
            articleRes["profil"] = article.getElementsByClassName("postprofile")[0];
            
            res.push(articleRes);
        }
        
        return res;

    }
    
    var idf_json;
    
    $.getJSON('idf.json', function(data) {
     idf_json = data;
    });

    $('#wat').tooltip();
    
    
//    loadThreadBodies(12898);

	downloadAndDo("https://forum.pirati.cz/search.php?search_id=newposts", loadThreadsToTable);
