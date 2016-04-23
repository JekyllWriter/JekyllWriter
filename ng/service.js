app.factory('storage', function() {
    var get = function(key) {
        var record;
        if (localStorage['_md_' + key]) {
            try {
                record = JSON.parse(localStorage['_md_' + key]);
                return record.value;
            } catch(e) {
                return null;
            }
        }
        return null;
    };

    var set = function(key, value) {
        var record = {
            value: value
        };

        localStorage['_md_' + key] = JSON.stringify(record);
        return value;
    }

    return {
        get: get,
        set: set
    };
})
.factory('trim', function() {
    return function(string) {
        return string.match(/^\s*(.*?)\s*$/)[1];
    }
})
.factory('file', function() {
    var read = function(fileName) {
        return fs.readFileSync(fileName);
    };

    var readDir = function(path) {
        return fs.readdirSync(path);
    };

    var write = function(fileName, data) {
        fs.closeSync(fs.openSync(fileName, 'w'));
        return fs.writeFileSync(fileName, data, 'utf8');
    };

    var mkDir = function(path) {
        var currentPath = path.match(/^[^\/]*/);
        path = path.match(/\/[^\/]+/g);

        for (var i = 0; i < path.length; i++) {
            currentPath += path[i];
            try {
                fs.statSync(currentPath);
            } catch(e) {
                fs.mkdirSync(currentPath);
            }
        }

        return undefined;
    };

    var listFile = function(path) {
        mkDir(path);

        return fs.readdirSync(path).reverse();
    };

    var deleteFile = function(fileName) {
        return fs.unlinkSync(fileName);
    };

    var isDirectory = function(path) {
        var stat;

        try {
            stat = fs.statSync(path);
            return stat.isDirectory();
        } catch(e) {
            return false;
        }
    };

    return {
        read: read,
        readDir: readDir,
        write: write,
        mkDir: mkDir,
        listFile: listFile,
        deleteFile: deleteFile,
        isDirectory: isDirectory
    }
})
.factory('savePost', function($rootScope, file, trim, today) {
    $rootScope.currentPath = {
        value: ''
    };
    
    return function(postSlug, postMeta, postContent, postDate, account) {
        if (!trim(postMeta.title)) {
            return {
                code: 1,
                error: 'No post title.'
            };
        } else {
            var metaData = {};

            for (var metaName in postMeta) {
                if (/^([^\[{]+,\s*)+[^\]},]+$/.test(postMeta[metaName])) {
                    metaData[metaName] = postMeta[metaName].split(',').map(trim);
                } else {
                    try {
                        metaData[metaName] = JSON.parse(postMeta[metaName]);
                    } catch(e) {
                        metaData[metaName] = postMeta[metaName];
                    }
                }
            }

            postContent = '---\n' + yaml.safeDump(metaData) + '---\n' + postContent;
            if ($rootScope.currentPath.value) {
                file.deleteFile($rootScope.currentPath.value);
            }
            postDate = postDate || today();
            var fileName = postDate + '-' + (trim(postSlug) || trim(postMeta.title)) + '.md';
            if (!account) {
                account = 'default';
            }
            var path = _userdata + '/User Data/' + account + '/post';

            file.mkDir(path);
            try {
                file.write(path + '/' + fileName, postContent);

                $rootScope.currentPath = {
                    value: path + '/' + fileName
                };

                return {
                    code: 0
                }
            } catch(error) {
                return {
                    code: 1,
                    error: error
                }
            }
        }
    }
})
.factory('listPost', function($rootScope, file) {
    return function() {
        var i, fileList,
            defaultPosts = [], accountPosts = [],
            account = $rootScope.account.value;

        fileList = file.listFile(_userdata + '/User Data/default/post');
        for (i = 0; i < fileList.length; i++) {
            if (/\.(md|markdown)$/.test(fileList[i])) {
                defaultPosts.push(fileList[i]);
            }
        }

        if (account) {
            fileList = file.listFile(_userdata + '/User Data/' + account + '/post');
            for (i = 0; i < fileList.length; i++) {
                if (/\.(md|markdown)$/.test(fileList[i])) {
                    accountPosts.push(fileList[i]);
                }
            }
        }

        return {
            default: defaultPosts,
            account: accountPosts
        };
    };
})
.factory('openPost', function($rootScope, trim, file) {
    return function(fileName, domain) {
        if (domain === 'default') {
            $rootScope.currentPath = {
                value: _userdata + '/User Data/default/post/' + fileName
            };
        } else {
            var account = $rootScope.account.value;
            $rootScope.currentPath = {
                value: _userdata + '/User Data/' + account + '/post/' + fileName
            };
        }

        var postContent, fileContent = file.read($rootScope.currentPath.value).toString();
        if (/^\s*---\s*(\r\n|\r|\n)+([\s\S]*?)(\r\n|\r|\n)+\s*---\s*/.test(fileContent)) {
            var metaData = fileContent.match(/^\s*---\s*(\r\n|\r|\n)+([\s\S]*?)(\r\n|\r|\n)+\s*---\s*/)[2];
            metaData = metaData.replace(/(\r\n|\r|\n)+/g, '$1')
                               .replace(/([^!])!binary/g, '$1!!binary');

            metaData = yaml.safeLoad(metaData);

            $rootScope.postMeta = {};
            for (var metaName in metaData) {
                if (typeof metaData[metaName] === 'string') {
                    $rootScope.postMeta[metaName] = metaData[metaName];
                } else if (Array.isArray(metaData[metaName])) {
                    $rootScope.postMeta[metaName] = metaData[metaName].join(', ');
                } else {
                    try {
                        $rootScope.postMeta[metaName] = JSON.stringify(metaData[metaName]);
                    } catch(e) {
                        $rootScope.postMeta[metaName] = '<Unexpected value>';
                    }
                }
            }

            $rootScope.postMeta.title = $rootScope.postMeta.title || '';
            $rootScope.postMeta.categories = $rootScope.postMeta.categories || '';
            $rootScope.postMeta.tags = $rootScope.postMeta.tags || '';
            $rootScope.postMeta.layout = $rootScope.postMeta.layout || 'post';

            

            postContent = fileContent.match(/^\s*---\s*(\r\n|\r|\n)+[\s\S]*?\n+\s*---\s*(\r\n|\r|\n)+([\s\S]*)$/);
            postContent = postContent.length > 3 ? postContent[3] : '';
        } else {
            postContent = fileContent;
        }

        $rootScope.postContent = {
            value: postContent
        };

        return {
            code: 0
        };
    };
})
.factory('deletePost', function($rootScope, file) {
    return function(fileName, domain) {
        try{
            if (domain === 'default') {
                file.deleteFile(_userdata + '/User Data/default/post/' + fileName);
            } else {
                var account = $rootScope.account.value;
                file.deleteFile(_userdata + '/User Data/' + account + '/post/' + fileName);
            }

            return {
                code: 0
            };
        } catch(error) {
            return {
                code: 1,
                error: error
            };
        }
    };
})
.factory('today', function() {
    return function() {
        var date = new Date();
        var day = date.getDate();
        var month = date.getMonth() + 1;
        var year = date.getFullYear();

        return year + '-' + (month < 10 ? '0' + month : month) + '-' + (day < 10 ? '0' + day : day);
    };
})
.factory('closeMessageBox', function($rootScope) {
    return function() {
        $rootScope.messagebox = {
            show: false
        };
    }; 
})
.factory('showMessageBox', function($rootScope, __basePath, closeMessageBox) {
    return function(message, icon, buttons) {
        $rootScope.messageicon = {
            value: false
        };

        if (!buttons) {
            buttons = [{
                text: 'OK',
                action: closeMessageBox
            }];
        }

        $rootScope.messagebody = {
            value: message
        };

        $rootScope.messageicon = {
            value: icon,
            url: 'file://' + __basePath + '/lib/materall-design-icon/ic_' + (icon || 'none') + '.svg'
        };

        $rootScope.buttons = {
            value: buttons
        };

        $rootScope.messagebox = {
            show: true
        };
    }
})
.factory('__basePath', function() {
    return __dirname.replace(/\\/g, '/');
})
.factory('github', function($http, $q) {
    var github = new GitHubApi({
        version: "3.0.0",
        debug: false,
        protocol: "https",
        host: "api.github.com",
        timeout: 5000
    });

    github.httpSend = function(msg, block, callback) {
        var method = block.method.toLowerCase();
        var hasFileBody = block.hasFileBody;
        var hasBody = !hasFileBody && ("head|get|delete".indexOf(method) === -1);
        var format = hasBody ? (block.requestFormat || this.constants.requestFormat) : 'query';
        var obj = getQueryAndUrl(msg, block, format, this.config);
        var query = obj.query;
        var url = this.config.url ? this.config.url + obj.url : obj.url;
        var path = url;
        var protocol = this.config.protocol || this.constants.protocol || "http";
        var host = block.host || this.config.host || this.constants.host;
        var port = this.config.port || this.constants.port || (protocol == "https" ? 443 : 80);

        if (!hasBody && query.length)
            path += "?" + query.join("&");

        var headers = {};

        if (hasBody) {
            if (format == "json")
                query = JSON.stringify(query);
            else if (format != "raw")
                query = query.join("&");
            headers["content-type"] = format == "json"
                ? "application/json; charset=utf-8"
                : format == "raw"
                    ? "text/plain; charset=utf-8"
                    : "application/x-www-form-urlencoded; charset=utf-8";
        }

        if (this.auth) {
            var basic;
            switch (this.auth.type) {
                case "oauth":
                    if (this.auth.token) {
                        path += (path.indexOf("?") === -1 ? "?" : "&") +
                            "access_token=" + encodeURIComponent(this.auth.token);
                    } else {
                        path += (path.indexOf("?") === -1 ? "?" : "&") +
                            "client_id=" + encodeURIComponent(this.auth.key) +
                            "&client_secret=" + encodeURIComponent(this.auth.secret);
                    }
                    break;
                case "token":
                    headers.authorization = "token " + this.auth.token;
                    break;
                case "basic":
                    basic = new Buffer(this.auth.username + ":" + this.auth.password, "ascii").toString("base64");
                    headers.authorization = "Basic " + basic;
                    break;
                default:
                    break;
            }
        }

        function getQueryAndUrl(msg, def, format, config) {
            var url = def.url;
            if (config.pathPrefix && url.indexOf(config.pathPrefix) !== 0) {
                url = config.pathPrefix + def.url;
            }
            var ret = {
                query: format == "json" ? {} : format == "raw" ? msg.data : []
            };
            if (!def || !def.params) {
                ret.url = url;
                return ret;
            }

            Object.keys(def.params).forEach(function(paramName) {
                paramName = paramName.replace(/^[$]+/, "");
                if (!(paramName in msg))
                    return;

                var isUrlParam = url.indexOf(":" + paramName) !== -1;
                var valFormat = isUrlParam || format != "json" ? "query" : format;
                var val;
                if (valFormat != "json") {
                    if (typeof msg[paramName] == "object") {
                        try {
                            msg[paramName] = JSON.stringify(msg[paramName]);
                            val = encodeURIComponent(msg[paramName]);
                        }
                        catch (ex) {
                            return Util.log("httpSend: Error while converting object to JSON: "
                                + (ex.message || ex), "error");
                        }
                    }
                    else if (def.params[paramName] && def.params[paramName].combined) {
                        // Check if this is a combined (search) string.
                        val = msg[paramName].split(/[\s\t\r\n]*\+[\s\t\r\n]*/)
                                            .map(function(part) {
                                                return encodeURIComponent(part);
                                            })
                                            .join("+");
                    }
                    else
                        val = encodeURIComponent(msg[paramName]);
                }
                else
                    val = msg[paramName];

                if (isUrlParam) {
                    url = url.replace(":" + paramName, val);
                }
                else {
                    if (format == "json")
                        ret.query[paramName] = val;
                    else if (format != "raw")
                        ret.query.push(paramName + "=" + val);
                }
            });
            ret.url = url;
            return ret;
        }

        function extend(dest, src, noOverwrite) {
            for (var prop in src) {
                if (!noOverwrite || typeof dest[prop] == "undefined")
                    dest[prop] = src[prop];
            }
            return dest;
        };

        function addCustomHeaders(customHeaders) {
            Object.keys(customHeaders).forEach(function(header) {
                var headerLC = header.toLowerCase();
                headers[headerLC] = customHeaders[header];
            });
        }
        addCustomHeaders(extend(msg.headers || {}, this.config.headers));

        if (!("accept" in headers))
            headers.accept = this.config.requestMedia || this.constants.requestMedia;

        var options = {
            host: host,
            port: port,
            path: path,
            method: method,
            headers: headers
        };

        if (this.config.rejectUnauthorized !== undefined)
            options.rejectUnauthorized = this.config.rejectUnauthorized;

        if (this.debug)
            console.log("REQUEST: ", options);

        $http({
            method: method,
            url: protocol + '://' + host + ':' + port + path,
            headers: headers,
            timeout: this.config.timeout,
            data: hasBody ? query : null
        }).then(function(res) {
            callback(null, res);
        }, function(err) {
            err.code = err.status;
            callback(err, null);
        });
    };

    github.ng = function(method, options, attempt) {
        var deferred = $q.defer();

        attempt = attempt || 0;

        method(options, function(err, result) {
            if (err) {
                if (Number(err.code) === 504 && attempt < 5) {
                    github.ng(method, options, attempt + 1).then(deferred.resolve, deferred.reject);
                } else {
                    deferred.reject(err);
                }
            } else {
                deferred.resolve(result);
            }
        });

        return deferred.promise;
    };

    return  github;
})
.factory('dropbox', function($http) {
    var dropbox = {};

    dropbox.getToken = function(code, callback) {
        $http.get('https://token.jekyllwriter.com/dropbox?code=' + code)
            .then(function(result) {
                if (result.error) {
                    callback({
                        code: 400,
                        message: result.error_description
                    }, null);
                } else {
                    dropbox.token = result.data.access_token;
                    callback(null, result.data);
                }
            }, function(err) {
                callback({
                    code: err.state,
                    message: err.data
                }, null);
            });
    };

    dropbox.setToken = function(token) {
        this.token = token;
    };

    dropbox.getInfo = function(callback) {
        $http.get('https://api.dropboxapi.com/1/account/info?access_token=' + dropbox.token)
            .then(function(result) {
                callback(null, result.data);
            }, function(err) {
                callback({
                    code: err.state,
                    message: err.data
                }, null);
            });
    };

    dropbox.makeFilePublic = function(fileName, callback) {
        $http.post('https://api.dropboxapi.com/1/shares/auto/' + fileName + '?short_url=false&access_token=' + dropbox.token)
            .then(function(result) {
                result.data.url = result.data.url.split('?')[0] + '?raw=1';
                callback(null, result.data);
            }, function(err) {
                callback({
                    code: err.state,
                    message: err.data.path
                }, null);
            });
    };

    dropbox.getFileList = function(callback) {
        $http.get('https://api.dropboxapi.com/1/metadata/auto/?access_token=' + dropbox.token)
            .then(function(result) {
                callback(null, result.data);
            }, function(err) {
                callback({
                    code: err.state,
                    message: err.data
                }, null);
            });
    };

    dropbox.uploadFile = function(path, data, callback) {
        $http.put('https://content.dropboxapi.com/1/files_put/auto/' + path + '?access_token=' + dropbox.token + 
            '&overwrite=false&autorename=true', data)
            .then(function(result) {
                callback(null, result.data);
            }, function(err) {
                callback({
                    code: err.state,
                    message: err.data
                }, null);
            });
    };

    dropbox.uploadPublicFile = function(path, data, callback) {
        dropbox.uploadFile(path, data, function(err, result) {
            if (err) {
                callback(err, null);
            } else {
                dropbox.makeFilePublic(result.path, callback);
            }
        });
    };

    return dropbox;
}).
factory('qiniu', function($http) {
    var qiniu = {};

    qiniu.urlSafeBase64 = function(data) {
        return new Buffer(data).toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_');
    };

    qiniu.init = function(bucket, access, secret) {
        this.bucket = bucket;
        this.access = access;
        this.secret = secret;
    };

    qiniu.sign = function(policy) {
        var sign, token = '';

        policy = this.urlSafeBase64(JSON.stringify(policy));
        sign = CryptoJS.HmacSHA1(policy, this.secret).toString(CryptoJS.enc.Base64);
        sign = sign.replace(/\+/g, '-').replace(/\//g, '_');
        token = this.access + ':' + sign + ':' + policy;
        return token;
    };

    qiniu.uploadFile = function(fileName, data, callback) {
        var policy = {
                scope: this.bucket + ':JekyllWriter/' + fileName,
                deadline: Math.floor(new Date().getTime() / 1000) + 3600
            },
            token = this.sign(policy),
            formData = new FormData();

        formData.append('key', 'JekyllWriter/' + fileName);
        formData.append('token', token);
        formData.append('file', data, fileName);

        $http.post('http://upload.qiniu.com/', formData, {
                headers: {'Content-Type': undefined}
            })
            .then(function(res) {
                callback(null, res.data);
            }, function(err) {
                callback(err.data, null);
            });
    };

    return qiniu;
});