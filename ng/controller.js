app.controller('header', function($scope, $rootScope, $timeout, $sce, storage, savePost, listPost, closeMessageBox, showMessageBox) {
    $rootScope.account = {
        value: storage.get('account') || null
    };

    $rootScope.recentData = {
        title: '',
        content: ''
    };

    $rootScope.postMeta = {
        title: '',
        layout: 'post'
    };

    $rootScope.loading = {
        show: false
    };

    $rootScope.loadingText = {
        text: ''
    };

    $scope.activeTab = 'home';

    $rootScope.fileMenu = {
        show: false
    };

    $scope.changeTab = function(tab) {
        $scope.activeTab = tab;
    };

    $scope.doAction = function(action) {
        switch (action) {
            case 'Save':
                $scope.savePost();
                break;
            case 'Open':
                $scope.listPost();
                break;
            case 'New':
                $scope.newPostConfirm();
                break;
            case 'Print':
                $scope.printPost();
                break;
            default:
                break;
        }
    };

    $scope.savePost = function() {
        var res = savePost($('#metaSlug').val(), $rootScope.postMeta, $rootScope.postContent.value,
            $('#metaDate').val(), $rootScope.account.value);

        if (res.code === 0) {
            $rootScope.recentData = {
                title: $rootScope.postMeta.title,
                content: $rootScope.postContent.value
            };
            //showMessageBox('Save post succeed!', 'succeed');
        } else {
            showMessageBox(res.error, 'error');
        }
    };

    $scope.listPost = function() {
        $rootScope.postList = listPost();
        $rootScope.explorer = {
            show: true
        };
    };

    $scope.newPostConfirm = function() {
        if ($rootScope.recentData.title !== $rootScope.postMeta.title ||
                $rootScope.recentData.content !== $rootScope.postContent.value) {
            showMessageBox('Do you want to save the changes you made to current post?', 'help', [{
                    text: 'Yes',
                    action: function() {
                        var res = savePost($('#metaSlug').val(), $rootScope.postMeta, $rootScope.postContent.value,
                            $('#metaDate').val(), $rootScope.account.value);

                        if (res.code === 1) {
                            showMessageBox(res.error, 'error');
                        } else {
                            $scope.newPost();
                            closeMessageBox();
                        } 
                    }
                }, {
                    text: 'No',
                    action: function() {
                        $scope.newPost();
                        closeMessageBox();
                    }
                }, {
                    text: 'Cancel',
                    action: closeMessageBox
                }]);
        } else {
            $scope.newPost();
        }
    };

    $scope.newPost = function() {
        $('#editorContent').css('opacity', 0);

        $rootScope.currentPath = {
            value: ''
        };

        $rootScope.recentData = {
            title: '',
            content: ''
        };

        $rootScope.postContent = {
            value: ''
        };

        $rootScope.postMeta = {
            title: '',
            layout: 'post'
        };

        $('#metaSlug').val('');
        $('#metaDate').datepicker('update', '');

        $timeout(function() {
            autosize.update($('#editorContent'));
            $('#editorContent').css('opacity', 1);
        }, 100);
    };

    $scope.previewPost = function() {
        if ($rootScope.preview.show) {
            $rootScope.preview = {
                show: false
            };

            $timeout(function() {
                $('#editorContent').focus();
            });

            return;
        }

        var markedCompatible = $rootScope.postContent.value.replace(/(#+)([^#\s])/g, '$1 $2');
        $rootScope.postMDContent = {
            value: $sce.trustAsHtml(kramed(markedCompatible))
        };

        $timeout(function() {
            $('.markdown-body a').click(function(event) {
                shell.openExternal($(this).attr('href'));
                return false;
            });

            $rootScope.preview = {
                show: true
            };
        });
    };

    $scope.printPost = function() {
        var markedCompatible = $rootScope.postContent.value.replace(/(#+)([^#\s])/g, '$1 $2');
        $rootScope.postMDContent = {
            value: $sce.trustAsHtml(kramed(markedCompatible))
        };

        $timeout(function() {
            window.print();
        });
    };

    $scope.exit = function() {
        $scope.$broadcast ('exit');
    };
})
.controller('titlebar', function($scope, $rootScope, storage, savePost, closeMessageBox, showMessageBox) {
    $rootScope.openMenu = {
        value: false
    };

    $scope.menu = [{
        title: 'Save',
        class: 'fa-floppy-o',
        display: storage.get('custom_menu_save_display') !== false
    }, {
        title: 'New',
        class: 'fa-file-text-o',
        display: !!storage.get('custom_menu_new_display')
    }, {
        title: 'Open',
        class: 'fa-folder-open-o ',
        display: !!storage.get('custom_menu_open_display')
    }, {
        title: 'Print',
        class: 'fa-print',
        display: !!storage.get('custom_menu_print_display')
    }];

    $scope.changeToolDisplay = function(tool) {
        for (var i = 0; i < $scope.menu.length; i++) {
            if ($scope.menu[i].title === tool) {
                $scope.menu[i].display = !$scope.menu[i].display;
                storage.set('custom_menu_' + tool.toLowerCase() + '_display', $scope.menu[i].display);
                break;
            }
        }
    };

    $scope.unsavedChanges = function() {
        return $rootScope.recentData.title !== $rootScope.postMeta.title ||
                $rootScope.recentData.content !== $rootScope.postContent.value
    };

    $scope.minimize = function() {
        remote.getCurrentWindow().minimize();
    };

    $scope.maximize = function() {
        if (remote.getCurrentWindow().isMaximized()) {
            remote.getCurrentWindow().unmaximize();
        } else {
            remote.getCurrentWindow().maximize();
        }
    };

    $scope.closeConfirm = function() {
        if ($rootScope.recentData.title !== $rootScope.postMeta.title ||
                $rootScope.recentData.content !== $rootScope.postContent.value) {
            showMessageBox('Do you want to save the changes you made to current post?', 'help', [{
                    text: 'Yes',
                    action: function() {
                        var res = savePost($('#metaSlug').val(), $rootScope.postMeta, $rootScope.postContent.value,
                            $('#metaDate').val(), $rootScope.account.value);

                        if (res.code === 1) {
                            showMessageBox(res.error, 'error');
                        } else {
                            $scope.close();
                        } 
                    }
                }, {
                    text: 'No',
                    action: function() {
                        $scope.close();
                    }
                }, {
                    text: 'Cancel',
                    action: closeMessageBox
                }]);
        } else {
            $scope.close();
        }
    };

    $scope.$on('exit', function() {  
        $scope.closeConfirm();
    });

    $scope.close = function() {
        remote.getCurrentWindow().close();
    };
})
.controller('meta', function($scope, $rootScope, trim, today) {
    $rootScope.metaBox = {
        show: false
    };

    $scope.initCalendar = function() {
        $('#metaDate').datepicker({
            format: 'yyyy-mm-dd'
        });
    };

    $scope.showAllMeta = function() {
        $rootScope.metaBox = {
            show: true
        };
    };

    $scope.close = function() {
        $rootScope.metaBox = {
            show: false
        };
    };

    $scope.remove = function(metaName) {
        delete $rootScope.postMeta[metaName];
    };

    $scope.edit = function(metaName) {
        $('#meta_' + metaName).val($rootScope.postMeta[metaName]);
        $('#metaRow_' + metaName).addClass('edit');
        $('#meta_' + metaName).focus();
    };

    $scope.save = function(metaName) {
        $rootScope.postMeta[metaName] = $('#meta_' + metaName).val();
        $('#metaRow_' + metaName).removeClass('edit');
    };

    $scope.cancel = function(metaName) {
        $('#metaRow_' + metaName).removeClass('edit');
    };

    $scope.insert = function() {
        var metaName = trim($('#NewMetaName').val()),
            metaValue = trim($('#NewMetaValue').val());

        metaName = metaName.replace(/[^a-z0-9_]/ig, '_');
        if (metaName && metaValue) {
            $rootScope.postMeta[metaName] = metaValue;
            $('.newMeta').removeClass('add');
            $('#NewMetaName').val('');
            $('#NewMetaValue').val('');
        };
    };

    $scope.cancelNew = function() {
        $('.newMeta').removeClass('add');
        $('#NewMetaName').val('');
        $('#NewMetaValue').val('');
    };

    $scope.addNew = function() {
        $('.newMeta').addClass('add');
    };
})
.controller('menubar', function($scope, $rootScope, storage, today, trim, savePost, listPost, github, showMessageBox, closeMessageBox) {
    $scope.token = '';

    $scope.getToken = function() {
        if (!$rootScope.account.value) {
            $scope.token = '';
            return;
        }

        $scope.token = '';

        var i, username = $rootScope.account.value.match(/^(.*?)[_$]/);

        if (!username) {
            username = $rootScope.account.value;
        } else {
            username = username[1];
        }

        for (i = 0; i < $rootScope.accounts.github.length; i++) {
            if ($rootScope.accounts.github[i].username === username) {
                $scope.token = $rootScope.accounts.github[i].token;
                break;
            }
        }

        if ($scope.token) {
            github.authenticate({
                type: 'oauth',
                token: $scope.token
            });
        }
    };
    
    $scope.$on('showAccountBox', function(event, accountType) {
        $scope.showAccountBox(accountType);
    });

    $scope.showAccountBox = function(accountType) {
        $rootScope.accountType = {
            value: accountType
        };

        $rootScope.accountBox = {
            show: true
        };
    };

    $scope.showMapBox = function() {
        $rootScope.map = {
            show: true
        };

        if (!GOOGMAP) {
            initMap();
        }
    };

    $scope.showPictureBox = function() {
        $rootScope.picture = {
            show: true
        };
    };

    $scope.showTableBox = function() {
        $rootScope.table = {
            show: true
        };
    };

    $scope.showTeXBox = function() {
        $rootScope.texbox = {
            show: true
        };
    };

    $scope.showTableYouTubeBox = function() {
        $rootScope.youtube = {
            show: true
        };
    };

    $scope.changeAccount = function() {
        storage.set('account', $rootScope.account.value);
        $rootScope.postList = listPost();

        $scope.getToken();
    };

    $scope.publishConfirm = function() {
        $scope.getToken();

        if (!trim($rootScope.postMeta.title)) {
            showMessageBox('No post title.', 'error');
        } else if (!$rootScope.postContent.value) {
            showMessageBox('Nothing to publish.', 'error');
        } else if (!$scope.token) {
            showMessageBox('Your current account is Public, please change to a GitHub account or add a new account to publish your post.', 'info');
        } else {
            var username = $rootScope.account.value.match(/^(.*?)[_$]/),
                repo = $rootScope.account.value.match(/^[^_]+_(.*)$/),
                branch = 'gh-pages';

            if (!username) {
                username = $rootScope.account.value;
            } else {
                username = username[1];
            }

            if (!repo) {
                var i;
                for (i = 0; i < $rootScope.repos.length; i++) {
                    if ((username + '.github.com').toLowerCase() === $rootScope.repos[i].repo.toLowerCase() ||
                        (username + '.github.io').toLowerCase() === $rootScope.repos[i].repo.toLowerCase()) {
                        repo = $rootScope.repos[i].repo;
                    }
                }
                branch = 'master';
            } else {
                repo = repo[1];
            }

            var path = '_posts/' + ($('#metaDate').val() || today()) + '-' + (trim($('#metaSlug').val()) || trim($rootScope.postMeta.title)) + '.md';

            showMessageBox('Would you like to save and publish now?', 'help', [{
                text: 'Yes',
                action: function() {
                    $scope.publish(username, repo, branch, path);
                    closeMessageBox();
                }
            }, {
                text: 'No',
                action: closeMessageBox
            }]);
        }
    };

    $scope.publish = function(username, repo, branch, path) {
        var res = savePost($('#metaSlug').val(), $rootScope.postMeta, $rootScope.postContent.value,
                $('#metaDate').val(), $rootScope.account.value);

        if (res.code === 1) {
            showMessageBox(res.error, 'error');
            return;
        }

        $rootScope.recentData.title = $rootScope.postMeta.title;
        $rootScope.recentData.content = $rootScope.postContent.value;

        $rootScope.loadingText = {
            text: 'Publishing post, please wait...'
        };

        $rootScope.loading = {
            show: true
        };

        $scope.getSHA(username, repo, branch, path, function(sha) {
            if (!sha) {
                $scope.create(username, repo, branch, path);
            } else {
                $scope.update(username, repo, branch, path, sha);
            }
        });
    };

    $scope.create = function(username, repo, branch, path) {
        var content = '---\n' + yaml.safeDump($rootScope.postMeta) + '---\n' + $rootScope.postContent.value;

        github.ng(github.repos.createContent, {
            user: username,
            repo: repo,
            content: new Buffer(content).toString('base64'),
            ref: branch,
            message: 'Publish ' + trim($rootScope.postMeta.title),
            path: path
        }).then(function(res) {
            $rootScope.loading = {
                show: false
            };

            showMessageBox('Publish post succeed!', 'succeed');
        }, function(err) {
            $rootScope.loading = {
                show: false
            };

            showMessageBox(err.message, 'error');
        });
    };

    $scope.update = function(username, repo, branch, path, sha) {

        var content = '---\n' + yaml.safeDump($rootScope.postMeta) + '---\n' + $rootScope.postContent.value;
        
        github.ng(github.repos.updateFile, {
            user: username,
            repo: repo,
            content: new Buffer(content).toString('base64'),
            ref: branch,
            sha: sha,
            message: 'Update ' + trim($rootScope.postMeta.title),
            path: path
        }).then(function(res) {
            $rootScope.loading = {
                show: false
            };
            showMessageBox('Publish post succeed!', 'succeed');
        }, function(err) {
            $rootScope.loading = {
                show: false
            };
            showMessageBox(err.message, 'error');
        });
    };

    $scope.getSHA = function(username, repo, branch, path, callback) {
        github.ng(github.repos.getContent, {
            user: username,
            repo: repo,
            ref: branch,
            path: path
        }).then(function(res) {
            callback(res.sha);
        }, function(err) {
            if (err.code === 404) {
                callback();
            } else {
                showMessageBox(err.message, 'error');
            }
        });
    };


    $rootScope.historyList = {
        value: []
    };

    $scope.setProxy = function() {
        $rootScope.proxyBox = {
            show: true
        };
    };

    $scope.getHistory = function() {
        $scope.getToken();

        if (!$scope.token) {
            showMessageBox('Your current account is Public, please change to a GitHub account or add a new account to get post history.', 'info');
            return;
        }

        if (!(trim($('#metaSlug').val()) || encodeURIComponent(trim($rootScope.postMeta.title)))) {
            showMessageBox('You need open a post first to read post history.', 'info');
            return;
        }

        $rootScope.loadingText = {
            text: 'Syncing post history list, please wait...'
        };

        $rootScope.loading = {
            show: true
        };

        $rootScope.history = {
            show: true
        };

        var username = $rootScope.account.value.match(/^(.*?)[_$]/),
            repo = $rootScope.account.value.match(/^[^_]+_(.*)$/),
            branch = 'gh-pages',
            postName = ($('#metaDate').val() || today()) + '-' + (trim($('#metaSlug').val()) || trim($rootScope.postMeta.title)) + '.md';

        $rootScope.historyList = {
            value: []
        };

        if (!username) {
            username = $rootScope.account.value;
        } else {
            username = username[1];
        }

        if (!repo) {
            var i;
            for (i = 0; i < $rootScope.repos.length; i++) {
                if ((username + '.github.com').toLowerCase() === $rootScope.repos[i].repo.toLowerCase() ||
                    (username + '.github.io').toLowerCase() === $rootScope.repos[i].repo.toLowerCase()) {
                    repo = $rootScope.repos[i].repo;
                }
            }
            branch = 'master';
        } else {
            repo = repo[1];
        }

        github.ng(github.repos.getCommits, {
            user: username,
            repo: repo,
            sha: branch,
            path: '_posts/' + postName
        }).then(function(commitList) {
            $scope.getCommit(username, repo, commitList, postName);
        }, function(err) {
            $rootScope.loading = {
                show: false
            };

            showMessageBox(err.message, 'error');
        });
    };

    $scope.getCommit = function(username, repo, commitList, postName, index) {
        index = index || 0;

        if (index >= commitList.length) {
            $rootScope.loading = {
                show: false
            };

            return;
        }

        var sha = commitList[index].sha;

        github.ng(github.repos.getCommit, {
            user: username,
            repo: repo,
            sha: sha
        }).then(function(commit) {
            var i;

            for (i = 0; i < commit.files.length; i++) {
                if (commit.files[i].filename === '_posts/' + postName) {
                    var time = new Date(Date.parse(commit.commit.committer.date));
                    time = time.getFullYear() + '-' +
                           (time.getMonth() + 1 < 10 ? '0' + (time.getMonth() + 1) : time.getMonth() + 1) + '-' +
                           (time.getDate() < 10 ? '0' + time.getDate() : time.getDate()) + ' ' +
                           (time.getHours() < 10 ? '0' + time.getHours() : time.getHours()) + ':' +
                           (time.getMinutes() < 10 ? '0' + time.getMinutes() : time.getMinutes()) + ':' +
                           (time.getSeconds() < 10 ? '0' + time.getSeconds() : time.getSeconds());

                    $rootScope.historyList.value.push({
                        date: time,
                        raw_url: commit.files[i].raw_url,
                        version: commitList.length - index
                    });

                    break;
                }
            }

            $scope.getCommit(username, repo, commitList, postName, index + 1);
        }, function(err) {
            $rootScope.loading = {
                show: false
            };

            showMessageBox(err.message, 'error');
        });
    };
})
.controller('font', function($scope, $rootScope, $timeout) {
    $scope.bold = function() {
        var currentScrollTop = $('#editor').scrollTop(),
            start = $('#editorContent')[0].selectionStart,
            end = $('#editorContent')[0].selectionEnd,
            len = $('#editorContent').val().length,
            before = $rootScope.postContent.value.substring(0, start);

        before += Array(start - before.length + 1).join('\n');

        $rootScope.postContent.value = before + '__' + $rootScope.postContent.value.substring(start, end) + '__' + $rootScope.postContent.value.substring(end, len);

        $timeout(function() {
            $('#editorContent')[0].selectionStart = start + 2;
            $('#editorContent')[0].selectionEnd = end + 2;

            autosize.update($('#editorContent'));
            $('#editorContent').focus();
            $('#editor').scrollTop(currentScrollTop);
        }, 100);
    };

    $scope.italic = function() {
        var currentScrollTop = $('#editor').scrollTop(),
            start = $('#editorContent')[0].selectionStart,
            end = $('#editorContent')[0].selectionEnd,
            len = $('#editorContent').val().length,
            before = $rootScope.postContent.value.substring(0, start);

        before += Array(start - before.length + 1).join('\n');

        $rootScope.postContent.value = before + '*' + $rootScope.postContent.value.substring(start, end) + '*' + $rootScope.postContent.value.substring(end, len);

        $timeout(function() {
            $('#editorContent')[0].selectionStart = start + 1;
            $('#editorContent')[0].selectionEnd = end + 1;

            autosize.update($('#editorContent'));
            $('#editorContent').focus();
            $('#editor').scrollTop(currentScrollTop);
        }, 100);
    };

    $scope.underline = function() {
        var currentScrollTop = $('#editor').scrollTop(),
            start = $('#editorContent')[0].selectionStart,
            end = $('#editorContent')[0].selectionEnd,
            len = $('#editorContent').val().length,
            before = $rootScope.postContent.value.substring(0, start);

        before += Array(start - before.length + 1).join('\n');

        $rootScope.postContent.value = before + '<u>' + $rootScope.postContent.value.substring(start, end) + '</u>' + $rootScope.postContent.value.substring(end, len);

        $timeout(function() {
            $('#editorContent')[0].selectionStart = start + 3;
            $('#editorContent')[0].selectionEnd = end + 3;

            autosize.update($('#editorContent'));
            $('#editorContent').focus();
            $('#editor').scrollTop(currentScrollTop);
        }, 100);
    };

    $scope.code = function() {
        $scope.insert('   ');
    };

    $scope.ul = function() {
        $scope.insert('*');
    };

    $scope.ol = function() {
        $scope.insert('1.');
    };

    $scope.quote = function() {
        $scope.insert('>');
    };

    $scope.hyperlink = function() {
        var currentScrollTop = $('#editor').scrollTop(),
            start = $('#editorContent')[0].selectionStart,
            end = $('#editorContent')[0].selectionEnd,
            len = $('#editorContent').val().length,
            before = $rootScope.postContent.value.substring(0, start),
            after = $rootScope.postContent.value.substring(end, len);

        before += Array(start - before.length + 1).join('\n');
        after = Array(len - end - after.length).join('\n') + after;

        $rootScope.postContent.value = before + '[' + $rootScope.postContent.value.substring(start, end) + '](http://)' + after;

        $timeout(function() {
            $('#editorContent')[0].selectionStart = start + 1;
            $('#editorContent')[0].selectionEnd = end + 1;

            autosize.update($('#editorContent'));
            $('#editorContent').focus();
            $('#editor').scrollTop(currentScrollTop);
        }, 100);
    };

    $scope.insert = function(symbol) {
        var prefix, suffix,
            currentScrollTop = $('#editor').scrollTop(),
            start = $('#editorContent')[0].selectionStart,
            end = $('#editorContent')[0].selectionEnd,
            len = $('#editorContent').val().length;

        prefix = start && $rootScope.postContent.value.substring(start - 1, start) !== '\n' ? '\n\n' + symbol + ' ' :
                (start > 1 && $rootScope.postContent.value.substring(start - 2, start - 1) !== '\n' ? '\n' + symbol + ' ' : symbol + ' ');
        
        suffix = len > end + 1 && $rootScope.postContent.value.substring(end, end + 1) !== '\n' ? '\n\n' :
                (len > end + 2 && $rootScope.postContent.value.substring(end + 1, end + 2) !== '\n' ? '\n' : '');
        
        $rootScope.postContent.value = $rootScope.postContent.value.substring(0, start) + prefix + $rootScope.postContent.value.substring(start, end) + suffix + $rootScope.postContent.value.substring(end, len);

        $timeout(function() {
            $('#editorContent')[0].selectionStart = start + prefix.length;
            $('#editorContent')[0].selectionEnd = end + prefix.length;

            autosize.update($('#editorContent'));
            $('#editorContent').focus();
            $('#editor').scrollTop(currentScrollTop);
        }, 100);
    };
})
.controller('heading', function($scope, $rootScope, $timeout) {
    $scope.heading1 = function() {
        $scope.insert('#');
    };

    $scope.heading2 = function() {
        $scope.insert('##');
    };

    $scope.heading3 = function() {
        $scope.insert('###');
    };

    $scope.heading4 = function() {
        $scope.insert('####');
    };

    $scope.heading5 = function() {
        $scope.insert('#####');
    };

    $scope.heading6 = function() {
        $scope.insert('######');
    };

    $scope.insert = function(symbol) {
        var prefix, suffix,
            currentScrollTop = $('#editor').scrollTop(),
            start = $('#editorContent')[0].selectionStart,
            end = $('#editorContent')[0].selectionEnd,
            len = $('#editorContent').val().length;

        prefix = start && $rootScope.postContent.value.substring(start - 1, start) !== '\n' ? '\n\n' + symbol + ' ' :
                (start > 1 && $rootScope.postContent.value.substring(start - 2, start - 1) !== '\n' ? '\n' + symbol + ' ' : symbol + ' ');
        
        suffix = len > end + 1 && $rootScope.postContent.value.substring(end, end + 1) !== '\n' ? '\n\n' :
                (len > end + 2 && $rootScope.postContent.value.substring(end + 1, end + 2) !== '\n' ? '\n' : '');
        
        $rootScope.postContent.value = $rootScope.postContent.value.substring(0, start) + prefix + $rootScope.postContent.value.substring(start, end) + suffix + $rootScope.postContent.value.substring(end, len);

        $timeout(function() {
            $('#editorContent')[0].selectionStart = start + prefix.length;
            $('#editorContent')[0].selectionEnd = end + prefix.length;

            autosize.update($('#editorContent'));
            $('#editorContent').focus();
            $('#editor').scrollTop(currentScrollTop);
        }, 100);
    };
})
.controller('map', function($scope, $rootScope, $timeout) {
    $rootScope.map = {
        show: false
    };

    $scope.close = function() {
        $rootScope.map = {
            show: false
        };
    };

    $scope.insertMap = function() {
        var url, lat = GOOGMAP.getCenter().lat(),
            lng = GOOGMAP.getCenter().lng(),
            zoom = GOOGMAP.getZoom(),
            type = GOOGMAP.mapTypeId;

        lng = ((lng + 180) % 360) - 180;
        url = 'https://maps.googleapis.com/maps/api/staticmap?' +
            'center=' + lat + ',' + lng +
            '&zoom=' + zoom + '&size=640x480&maptype=' + type;

        $scope.insert(url);
    };

    $scope.insert = function(url) {
        var map, suffix,
            currentScrollTop = $('#editor').scrollTop(),
            start = $('#editorContent')[0].selectionStart,
            end = $('#editorContent')[0].selectionEnd,
            len = $('#editorContent').val().length;

        prefix = start && $rootScope.postContent.value.substring(start - 1, start) !== '\n![' ? '\n\n![' :
                (start > 1 && $rootScope.postContent.value.substring(start - 2, start - 1) !== '\n' ? '\n![' : '![');
        
        suffix = len > end + 1 && $rootScope.postContent.value.substring(end, end + 1) !== '](' + url + ')\n' ? '](' + url + ')\n\n' :
                (len > end + 2 && $rootScope.postContent.value.substring(end + 1, end + 2) !== '\n' ? '\n](' + url + ')' : '](' + url + ')');
        
        $rootScope.postContent.value = $rootScope.postContent.value.substring(0, start) + prefix + $rootScope.postContent.value.substring(start, end) + suffix + $rootScope.postContent.value.substring(end, len);

        $timeout(function() {
            $('#editorContent')[0].selectionStart = start + prefix.length;
            $('#editorContent')[0].selectionEnd = end + prefix.length;

            autosize.update($('#editorContent'));

            $rootScope.map = {
                show: false
            };

            $('#editorContent').focus();
            $('#editor').scrollTop(currentScrollTop);
        }, 100);
    };
})
.controller('main', function($scope, $rootScope) {
    $rootScope.postContent = {
        value: ''
    };

    $rootScope.preview = {
        show: false
    };

    $scope.backEdit = function() {
        $rootScope.preview = {
            show: false
        };
    };
})
.controller('editor', function($scope) {
    var parenthese = false,
        squarebrackets = false,
        braces = false;

    $scope.initTextarea = function() {
        autosize($('#editorContent'));

        $('#editorContent').keydown(function(e) {
            var start = this.selectionStart,
            end = this.selectionEnd,
            len = this.value.length;

            if (e.keyCode === 9) {
                this.value = this.value.substring(0, start) + '    ' + this.value.substring(end, len);

                this.selectionStart = start + 4;
                this.selectionEnd = start + 4;
                e.preventDefault();
            } else if (e.shiftKey && e.keyCode === 219) {
                braces = true;
                setTimeout(function() {
                    braces = false;
                }, 200);

                this.value = this.value.substring(0, start) + '{' + this.value.substring(start, end) + '}' + this.value.substring(end, len);

                this.selectionStart = start + 1;
                this.selectionEnd = end + 1;
                e.preventDefault();
            } else if (e.shiftKey && e.keyCode === 57) {
                parenthese = true;
                setTimeout(function() {
                    parenthese = false;
                }, 200);

                this.value = this.value.substring(0, start) + '(' + this.value.substring(start, end) + ')' + this.value.substring(end, len);

                this.selectionStart = start + 1;
                this.selectionEnd = end + 1;
                e.preventDefault();
            } else if (e.keyCode === 219) {
                squarebrackets = true;
                setTimeout(function() {
                    squarebrackets = false;
                }, 200);

                this.value = this.value.substring(0, start) + '[' + this.value.substring(start, end) + ']' + this.value.substring(end, len);

                this.selectionStart = start + 1;
                this.selectionEnd = end + 1;
                e.preventDefault();
            } else if (e.keyCode === 13) {
                var i, spaces, ulMinus, ulStar, ulPlus, ol, olDot, quote, prefix, linelen = 0,
                lines = this.value.split('\n');

                for (i = 0; i < lines.length; i++) {
                    linelen += lines[i].length + 1;
                    if (linelen > start) {
                        spaces = lines[i].match(/^\s*/)[0];
                        ulMinus = lines[i].match(/^\s*\- /);
                        ulPlus = lines[i].match(/^\s*\+ /);
                        ulStar = lines[i].match(/^\s*\* /);
                        ol = lines[i].match(/^\s*(\d+)\. /);
                        quote = lines[i].match(/^\s*> /);

                        if (ol) {
                            prefix = spaces + (Number(ol[1]) + 1) + '. ';
                        } else if (ulMinus) {
                            prefix = ulMinus[0];
                        } else if (ulPlus) {
                            prefix = ulPlus[0];
                        } else if (ulStar) {
                            prefix = ulStar[0];
                        } else if (quote) {
                            prefix = quote[0];
                        } else {
                            prefix = spaces;
                        }

                        this.value = this.value.substring(0, start) + '\n' + prefix + this.value.substring(end, len);

                        this.selectionStart = end + prefix.length + 1;
                        this.selectionEnd = end + prefix.length + 1;
                        break;
                    }
                }
                autosize.update($('#editorContent'));
                
                $('#editorTitle').focus();
                $('#editorContent').focus();

                e.preventDefault();
            } else if (e.keyCode === 8 && this.selectionStart === this.selectionEnd) {
                var i, j, indentation, removechar, spaces = [], linelen = 0,
                lines = this.value.split('\n');

                for (i = 0; i < lines.length; i++) {
                    linelen += lines[i].length + 1;
                    if (linelen > start) {
                        if (/^\s*([\-\+\*>]|\d+\.)\s*$/.test(lines[i])) {
                            indentation = lines[i].match(/^(\s*)/);
                            indentation = indentation ? indentation[1] : '';
                            removechar = lines[i].length - indentation.length;
                            lines[i] = indentation;

                            this.value = lines.join('\n');
                            this.selectionStart = start - removechar;
                            this.selectionEnd = start - removechar;

                            autosize.update($('#editorContent'));
                    
                            $('#editorTitle').focus();
                            $('#editorContent').focus();
                            
                            e.preventDefault();
                        } else if (/^\s+$/.test(lines[i])) {
                            if (spaces.length === 0 || spaces[0] >= lines[i].length) {
                                removechar = lines[i].length;
                                lines[i] = '';
                            } else {
                                for (j = spaces.length - 1; j >= 0; j--) {
                                    if (spaces[j] < lines[i].length) {
                                        removechar = lines[i].length - spaces[j];
                                        lines[i] = lines[i].substr(0, spaces[j]);
                                        break;
                                    }
                                }
                            }

                            this.value = lines.join('\n');
                            this.selectionStart = start - removechar;
                            this.selectionEnd = start - removechar;

                            autosize.update($('#editorContent'));
                    
                            $('#editorTitle').focus();
                            $('#editorContent').focus();
                            
                            e.preventDefault();
                        }

                        break;
                    } else {
                        indentation = lines[i].match(/^(\s+)/);
                        if (indentation) {
                            if (spaces.length === 0 || indentation[1].length > spaces.slice(-1)) {
                                spaces.push(indentation[1].length);
                            } else {
                                spaces = [indentation[1].length];
                            }
                        }
                    }
                }
            } else if (e.shiftKey && e.keyCode === 48 && parenthese && this.selectionStart === this.selectionEnd) {
                this.selectionStart++;
                e.preventDefault();
            } else if (e.shiftKey && e.keyCode === 221 && braces && this.selectionStart === this.selectionEnd) {
                this.selectionStart++;
                e.preventDefault();
            } else if (e.keyCode === 221 && squarebrackets && this.selectionStart === this.selectionEnd) {
                this.selectionStart++;
                e.preventDefault();
            }
        });
    };
})
.controller('explorer', function($scope, $rootScope, $timeout, $http, github, file, closeMessageBox, showMessageBox, listPost, savePost, openPost, deletePost) {
    $rootScope.explorer = {
        show: false
    };

    $scope.close = function() {
        $rootScope.explorer = {
            show: false
        };
    };

    $scope.getPostSlug = function(fileName) {
        if (/^\d{4}-\d{2}-\d{2}-(.*)\.(md|markdown)$/.test(fileName)) {
            return decodeURIComponent(fileName.match(/^\d{4}-\d{2}-\d{2}-(.*)\.(md|markdown)$/)[1]);
        } else {
            return decodeURIComponent(fileName.match(/^(.*)\.(md|markdown)$/)[1]);
        }  
    };

    $scope.getPostDate = function(fileName) {
        if (/^(\d{4}-\d{2}-\d{2})-.*\.(md|markdown)$/.test(fileName)) {
            return fileName.match(/^(\d{4}-\d{2}-\d{2})-.*\.(md|markdown)$/)[1];
        } else {
            return '1989-06-16';
        } 
    };

    $scope.openPost = function(fileName, domain) {
        $('#editorContent').css('opacity', 0);
        openPost(fileName, domain);

        $('#metaSlug').val($scope.getPostSlug(fileName));
        $('#metaDate').datepicker('update', $scope.getPostDate(fileName));

        $scope.close();

        $rootScope.recentData = {
            title: $rootScope.postMeta.title,
            content: $rootScope.postContent.value
        };

        $rootScope.preview = {
            show: false
        };

        $timeout(function() {
            autosize.update($('#editorContent'));
            $('#editorContent').css('opacity', 1);
        }, 100);
    };

    $scope.openPostConfirm = function(fileName, domain) {
        if ($rootScope.recentData.title !== $rootScope.postMeta.title ||
                $rootScope.recentData.content !== $rootScope.postContent.value) {
            showMessageBox('Do you want to save the changes you made to current post?', 'help', [{
                    text: 'Yes',
                    action: function() {
                        var res = savePost($('#metaSlug').val(), $rootScope.postMeta, $rootScope.postContent.value,
                            $('#metaDate').val(), $rootScope.account.value);

                        if (res.code === 1) {
                            showMessageBox(res.error, 'error');
                        } else {
                            $scope.openPost(fileName, domain);
                            closeMessageBox();
                        } 
                    }
                }, {
                    text: 'No',
                    action: function() {
                        $scope.openPost(fileName, domain);
                        closeMessageBox();
                    }
                }, {
                    text: 'Cancel',
                    action: closeMessageBox
                }]);
        } else {
            $scope.openPost(fileName, domain);
        }
    };

    $scope.deletePost = function(fileName, domain) {
        showMessageBox('Are you sure you want to delete post "' +
            $scope.getPostSlug(fileName) + '"?', 'help', [{
                text: 'OK',
                action: function() {
                    deletePost(fileName, domain);
                    $rootScope.postList = listPost();
                    closeMessageBox();
                }
            }, {
                text: 'Cancel',
                action: closeMessageBox
            }]);
    };

    $scope.getToken = function() {
        if (!$rootScope.account.value) {
            $scope.token = '';
            return;
        }

        $scope.token = '';

        var i, username = $rootScope.account.value.match(/^(.*?)[_$]/);

        if (!username) {
            username = $rootScope.account.value;
        } else {
            username = username[1];
        }

        for (i = 0; i < $rootScope.accounts.github.length; i++) {
            if ($rootScope.accounts.github[i].username === username) {
                $scope.token = $rootScope.accounts.github[i].token;
                break;
            }
        }

        if ($scope.token) {
            github.authenticate({
                type: 'oauth',
                token: $scope.token
            });
        }
    };

    $scope.getRemotePostList = function(callback) {
        var username = $rootScope.account.value.match(/^(.*?)[_$]/),
            repo = $rootScope.account.value.match(/^[^_]+_(.*)$/),
            branch = 'gh-pages';

        if (!username) {
            username = $rootScope.account.value;
        } else {
            username = username[1];
        }

        if (!repo) {
            var i;
            for (i = 0; i < $rootScope.repos.length; i++) {
                if ((username + '.github.com').toLowerCase() === $rootScope.repos[i].repo.toLowerCase() ||
                    (username + '.github.io').toLowerCase() === $rootScope.repos[i].repo.toLowerCase()) {
                    repo = $rootScope.repos[i].repo;
                }
            }
            branch = 'master';
        } else {
            repo = repo[1];
        }

        github.ng(github.repos.getContent, {
            user: username,
            repo: repo,
            ref: branch,
            path: '_posts'
        }).then(function(res) {
            callback(res);
        }, function(err) {
            if (err.code === 404) {
                callback([]);
            } else {
                $rootScope.loading = {
                    show: false
                };
                showMessageBox(err.message, 'error');
            }
        });
    };

    $scope.coverAll = false;

    $scope.skipAll = false;

    $scope.getPostContent = function(postList, index) {
        index = index || 0;
        if (index >= postList.length) {
            $rootScope.loading = {
                show: false
            };
            showMessageBox('Sync post list succeed!', 'succeed');
            $scope.coverAll = false;
            $scope.skipAll = false;
            return;
        }

        var fileName = postList[index].name;
        if (!/\.(md|markdown)$/.test(fileName)) {
            $scope.getPostContent(postList, index + 1);
            return;
        }

        if ($scope.coverAll) {
            $scope.downloadPost(postList[index], function() {
                $scope.getPostContent(postList, index + 1);
            });
            return;
        }

        try {
            var path = $rootScope.account.value === 'default' ?
                _userdata + '/User Data/default/post/' + fileName :
                _userdata + '/User Data/' + $rootScope.account.value + '/post/' + fileName;

            file.read(path)

            if ($scope.skipAll) {
                $scope.getPostContent(postList, index + 1);
                return;
            }
            
            showMessageBox('Would you like to overwrite ' + $scope.getPostSlug(fileName) + '?', 'help', [{
                text: 'Yes',
                action: function() {
                    closeMessageBox();
                    $scope.downloadPost(postList[index], function() {
                        $scope.getPostContent(postList, index + 1);
                    });
                }
            }, {
                text: 'Yes to All',
                action: function() {
                    closeMessageBox();
                    $scope.coverAll = true;
                    $scope.downloadPost(postList[index], function() {
                        $scope.getPostContent(postList, index + 1);
                    });
                }
            }, {
                text: 'No',
                action: function() {
                    closeMessageBox();
                    $scope.getPostContent(postList, index + 1);
                }
            }, {
                text: 'No to All',
                action: function() {
                    closeMessageBox();
                    $scope.skipAll = true;
                    $scope.getPostContent(postList, index + 1);
                }
            }]);
        } catch(err) {
            $scope.downloadPost(postList[index], function() {
                $scope.getPostContent(postList, index + 1);
            });
        }
    };

    $scope.downloadPost = function(item, callback) {
        var path,
            fileName = decodeURIComponent(item.name);

        if (!$rootScope.account.value) {
            path = _userdata + '/User Data/default/post';
        } else {
            path = _userdata + '/User Data/' + $rootScope.account.value + '/post';
        }

        file.mkDir(path);
        try {
            $http.get(item.download_url).then(function(content) {
                file.write(path + '/' + fileName, content.data);

                $rootScope.postList = listPost();

                callback();
            }, function(err) {
                showMessageBox(err.message, 'error');
            });
        } catch(err) {
            showMessageBox(err.message, 'error');
        }
    }

    $scope.syncPostList = function() {
        $scope.getToken();

        if (!$scope.token) {
            showMessageBox('Your current account is Public, please change to a GitHub account or add a new account to publish your post.', 'info');
            return;
        }

        $rootScope.loadingText = {
            text: 'Syncing post list, please wait...'
        };

        $rootScope.loading = {
            show: true
        };

        $scope.getRemotePostList($scope.getPostContent);
    };
})
.controller('history', function($scope, $rootScope, $timeout, $http, today, trim, showMessageBox) {
    $rootScope.history = {
        show: false
    };
    
    $scope.close = function() {
        $rootScope.history = {
            show: false
        };
    };

    $scope.openHistory = function(url) {
        $rootScope.loadingText = {
            text: 'Loading history version, please wait...'
        };

        $rootScope.loading = {
            show: true
        };
        
        $http.get(url).then(function(content) {
            var fileContent = content.data;

            if (/^\s*---\s*(\r\n|\r|\n)+([\s\S]*?)(\r\n|\r|\n)+\s*---\s*/.test(fileContent)) {
                var metaData = fileContent.match(/^\s*---\s*(\r\n|\r|\n)+([\s\S]*?)(\r\n|\r|\n)+\s*---\s*/)[2];
                metaData = metaData.replace(/(\r\n|\r|\n)+/g, '$1')
                                   .replace(/([^!])!binary/g, '$1!!binary');

                $rootScope.postMeta = yaml.safeLoad(metaData);
                $rootScope.postMeta.title = $rootScope.postMeta.title || '';
                $rootScope.postMeta.categories = $rootScope.postMeta.categories || '';
                $rootScope.postMeta.tags = $rootScope.postMeta.tags || '';
                $rootScope.postMeta.layout = $rootScope.postMeta.layout || 'post';

                postContent = fileContent.match(/^\s*---\s*(\r\n|\r|\n)+[\s\S]*?\n+\s*---\s*(\r\n|\r|\n)+([\s\S]*)$/);
                postContent = postContent.length > 3 ? postContent[3] : '';
            } else {
                postContent = fileContent;
            }

            $('#editorContent').css('opacity', 0);

            $rootScope.postContent = {
                value: postContent
            };

            $rootScope.history = {
                show: false
            };

            $rootScope.preview = {
                show: false
            };

            $timeout(function() {
                autosize.update($('#editorContent'));
                $('#editorContent').css('opacity', 1);

                $rootScope.history = {
                    show: false
                };

                $rootScope.loading = {
                    show: false
                };
            }, 100);
        }, function(err) {
            $rootScope.loading = {
                show: false
            };

            showMessageBox(err.message, 'error');
        });
    };
})
.controller('table', function($scope, $rootScope, $timeout) {
    $rootScope.table = {
        show: false
    };

    $scope.tableClass = '';

    $scope.close = function() {
        $rootScope.table = {
            show: false
        };
    };

    $scope.insertTable = function(row, column) {
        if (row === 1) {
            var table = rowLine = '|' + Array(column + 1).join('     |');
        } else {
            var rowLine = '|' + Array(column + 1).join('     |') + '\n',
                tableHr = '|' + Array(column + 1).join(':---:|') + '\n',
                tableBody = Array(row).join(rowLine),
                table = rowLine + tableHr + tableBody.substr(0, tableBody.length - 1);
        }

        $scope.insert(table);

        $rootScope.table = {
            show: false
        };
    };

    $scope.insert = function(table) {
        var prefix, suffix,
            start = $('#editorContent')[0].selectionStart,
            end = $('#editorContent')[0].selectionEnd,
            len = $('#editorContent').val().length;

        prefix = start && $rootScope.postContent.value.substring(start - 1, start) !== '\n' ? '\n\n' :
                (start > 1 && $rootScope.postContent.value.substring(start - 2, start - 1) !== '\n' ? '\n' : '');
        
        suffix = len > end + 1 && $rootScope.postContent.value.substring(end, end + 1) !== '\n' ? '\n\n' :
                (len > end + 2 && $rootScope.postContent.value.substring(end + 1, end + 2) !== '\n' ? '\n' : '');
        
        $rootScope.postContent.value = $rootScope.postContent.value.substring(0, start) + prefix + table + suffix + $rootScope.postContent.value.substring(end, len);

        $timeout(function() {
            $('#editorContent')[0].selectionStart = start + (prefix + table).length;
            $('#editorContent')[0].selectionEnd = start + (prefix + table).length;

            autosize.update($('#editorContent'));
            $('#editorContent').focus();
        }, 100);
    };
})
.controller('youtube', function($scope, $rootScope, $timeout, showMessageBox) {
    $rootScope.youtube = {
        show: false
    };

    $scope.close = function() {
        $rootScope.youtube = {
            show: false
        };
    };

    $scope.insertYouTube = function() {
        var url = $('#youtubeURL').val();

        if (/[\?&]v=([^&]+)/.test(url)) {
            var id = url.match(/[\?&]v=([^&]+)/)[1];

            $('#youtubeURL').val('');
            $scope.insert(id);
        } else {
            showMessageBox('Unrecognized YouTube URL.', 'error');
        }
    };

    $scope.insert = function(id) {
        var start = $('#editorContent')[0].selectionStart,
            end = $('#editorContent')[0].selectionEnd,
            len = $('#editorContent').val().length,
            youtubeIframe = '<iframe width="560" height="315" src="https://www.youtube.com/embed/' + id +
                '" frameborder="0" allowfullscreen></iframe>';

        $rootScope.postContent.value = $rootScope.postContent.value.substring(0, start) + youtubeIframe + $rootScope.postContent.value.substring(end, len);

        $timeout(function() {
            $('#editorContent')[0].selectionStart = start + youtubeIframe.length;
            $('#editorContent')[0].selectionEnd = start + youtubeIframe.length;

            autosize.update($('#editorContent'));
            $rootScope.youtube = {
                show: false
            };
            
            $('#editorContent').focus();
        }, 100);
    };
})
.controller('account', function($scope, $rootScope, __basePath, file, storage, github, dropbox, showMessageBox, closeMessageBox) {
    $rootScope.loading = {
        show: false
    };

    $scope.githubAccount = {
        token: ''
    };

    $scope.dropboxAccount = {
        code: ''
    };

    $scope.qiniuAccount = {
        bucket: '',
        access: '',
        secret: ''
    };

    $rootScope.accountBox = {
        show: false
    };

    $scope.showAccountField = false;

    $scope.icon = {
        GitHub: 'fa-github',
        Dropbox: 'fa-dropbox',
        OneDrive: 'fa-cloud',
        Qiniu: 'fa-cloud'
    };

    $scope.newPath = [];
    $scope.pathName = [];
    $scope.pathNameErr = [];
    
    $scope.getToken = function(username) {
        $scope.token = '';

        for (var i = 0; i < $rootScope.accounts.github.length; i++) {
            if ($rootScope.accounts.github[i].username === username) {
                $scope.token = $rootScope.accounts.github[i].token;
                break;
            }
        }

        if ($scope.token) {
            github.authenticate({
                type: 'oauth',
                token: $scope.token
            });
        }
    };

    $scope.showNewPath = function(index) {
        $scope.newPath[index] = !$scope.newPath[index];
        $scope.pathNameErr[index] = false;
    };

    $scope.checkPath = function(username, index) {
        $scope.pathName[index] = $scope.pathName[index] || '';
        path = $scope.pathName[index].replace(/^\s*|\s*$/g, '');
        $scope.pathNameErr[index] = !/^[A-Za-z0-9_-]*$/.test(path);
        if (!$scope.pathNameErr[index]) {
            var repo = path || username + '.github.io';
            $scope.getToken(username);
            $scope.checkRepoExit(username, repo, index);
        }
    };

    $scope.checkRepoExit = function(username, repo, index) {
        $scope.close();

        $rootScope.loadingText = {
            text: 'Checking whether the path exits...'
        };

        $rootScope.loading = {
            show: true
        };

        var branch;
        if ((username + '.github.com').toLowerCase() === repo.toLowerCase() ||
                (username + '.github.io').toLowerCase() === repo.toLowerCase()) {
            branch = 'master';
        } else {
            branch = 'gh-pages';
        }

        $scope.getRepo(username, repo, branch, index);
    };

    $scope.getRepo = function(username, repo, branch, index) {
        github.ng(github.repos.get, {user: username, repo: repo}).then(function(info) {
            $scope.getRepoContent(username, repo, branch, '', function() {
                $rootScope.loading = {
                    show: false
                };

                showMessageBox('The path already exits, would you like to overwrite?', 'help', [{
                    text: 'Yes',
                    action: function() {
                        closeMessageBox();
                        $scope.uploadDefaultTheme(username, repo, branch, index);
                    }
                }, {
                    text: 'No',
                    action: function() {
                        closeMessageBox();
                        $rootScope.$broadcast('showAccountBox', 'GitHub');
                    }
                }]);
            }, function() {
                if (info.size === 0) { // Empty repo
                   $scope.createReadme(username, repo, index);
                } else {
                    $scope.createGhPagesBranch(username, repo, index);
                }
            });
        }, function() {
            $scope.createRepo(username, repo, index);
        });
    };

    $scope.createRepo = function(username, repo, index) {
        $rootScope.loadingText = {
            text: 'Creating repository...'
        };

        github.ng(github.repos.create, {name: repo}).then(function() {
            $scope.createReadme(username, repo, index);
        }, function() {
            $rootScope.loading = {
                show: false
            };

            showMessageBox('Create path failed, please try again later.', 'error', [{
                text: 'OK',
                action: function() {
                    closeMessageBox();
                    $rootScope.$broadcast('showAccountBox', 'GitHub');
                }
            }]);
        });
    };
    
    $scope.createReadme = function(username, repo, index) {
        $rootScope.loadingText = {
            text: 'Initial repository...'
        };

        github.ng(github.repos.createContent, {
            user: username,
            repo: repo,
            path: 'README.md',
            message: 'Initial',
            content: btoa('Created by Jekyll Writer')
        }).then(function() {
            if ((username + '.github.com').toLowerCase() === repo.toLowerCase() ||
                (username + '.github.io').toLowerCase() === repo.toLowerCase()) {
                $scope.uploadDefaultTheme(username, repo, 'master', index);
            } else {
                $scope.createGhPagesBranch(username, repo, index);
            }
        }, function() {
            $rootScope.loading = {
                show: false
            };

            showMessageBox('Initial path failed, please try again later.', 'error', [{
                text: 'OK',
                action: function() {
                    closeMessageBox();
                    $rootScope.$broadcast('showAccountBox', 'GitHub');
                }
            }]);
        });
    };
    
    $scope.createGhPagesBranch = function(username, repo, index) {
        $scope.getDefaultBranch(username, repo, function(branch) {
            if (branch === null) {
                return;
            }
            
            github.ng(github.gitdata.getReference, {user: username, repo: repo, ref: 'heads/' + branch}).then(function(info) {
                $rootScope.loadingText = {
                    text: 'Creating gh-pages branch...'
                };

                var sha = info.object.sha;
                github.ng(github.gitdata.createReference, {user: username, repo: repo, ref: 'refs/heads/gh-pages', sha: sha}).then(function() {
                    $scope.uploadDefaultTheme(username, repo, 'gh-pages', index);
                }, function() {
                    $rootScope.loading = {
                        show: false
                    };

                    showMessageBox('Create gh-pages branch failed, please try again later.', 'error', [{
                        text: 'OK',
                        action: function() {
                            closeMessageBox();
                            $rootScope.$broadcast('showAccountBox', 'GitHub');
                        }
                    }]);
                });
            }, function() {
                $rootScope.loading = {
                    show: false
                };

                showMessageBox('Get default branch heads SHA failed, please try again later.', 'error', [{
                    text: 'OK',
                    action: function() {
                        closeMessageBox();
                        $rootScope.$broadcast('showAccountBox', 'GitHub');
                    }
                }]);
            });
        });
    };
    
    $scope.getDefaultBranch = function(username, repo, callback) {
        $rootScope.loadingText = {
            text: 'Fetching default branch information...'
        };

        github.ng(github.repos.get, {user: username, repo: repo}).then(function(info) {
            callback(info.default_branch);
        }, function() {
            $rootScope.loading = {
                show: false
            };

            showMessageBox('Get default branch failed, please try again later.', 'error', [{
                text: 'OK',
                action: function() {
                    closeMessageBox();
                    $rootScope.$broadcast('showAccountBox', 'GitHub');
                }
            }]);
            callback(null);
        });
    };
    
    $scope.uploadDefaultTheme = function(username, repo, branch, index) {
        $rootScope.loadingText = {
            text: 'Uploading theme...'
        };

        $rootScope.loading = {
            show: true
        };
        $scope.uploadFiles(username, repo, branch, __basePath + '/themes/default', __basePath + '/themes/default/', index);
    };

    $scope.getUploadList = function(path) {
        var i, list = file.readDir(path);

        for (i = 0; i < list.length; i++) {
            if (/^\./.test(list[i])) {
                continue;
            }

            if (file.isDirectory(path + '/' + list[i])) {
                $scope.getUploadList(path + '/' + list[i]);
            } else {
                $scope.uploadList.push({
                    name: path + '/' + list[i],
                    stat: 0
                });
            }
        }
    };

    $scope.uploadFiles = function(username, repo, branch, path, basePath, index) {
        $scope.uploadList = [];
        $scope.getUploadList(path);

        var content, filename;

        $scope.uploadList.forEach(function(item) {
            filename = item.name.substr(basePath.length);
            content = file.read(item.name);
            if (filename === '_config.yml') {
                if (branch === 'gh-pages') {
                    content += '\nbaseurl: "/' + repo + '"';
                } else {
                    content += '\nbaseurl: ""';
                }
            }

            content = new Buffer(content, 'binary').toString('base64');
            
            github.ng(github.gitdata.createBlob, {
                user: username,
                repo: repo,
                content: content,
                encoding: 'base64'
            }).then(function(gitInfo) {
                item.stat = 1;
                item.sha = gitInfo.sha;
                $scope.checkUploadList(username, repo, branch, basePath, index);
            }, function() {
                item.stat = 2;
                $scope.uploadFile(username, repo, branch, basePath, content, item, index);
            });
        });
    };

    $scope.uploadFile = function(username, repo, branch, basePath, content, info, index) {
        if (info.stat > 3) {
            $scope.checkUploadList(username, repo, branch, basePath, index);
            return;
        } else {
            github.ng(github.gitdata.createBlob, {
                user: username,
                repo: repo,
                content: content,
                encoding: 'base64'
            }).then(function(gitInfo) {
                info.stat = 1;
                info.sha = gitInfo.sha;
                $scope.checkUploadList(username, repo, branch, basePath, index);
            }, function() {
                info.stat++;
                $scope.uploadFile(username, repo, branch, basePath, content, info, index);
            });
        }
    };

    $scope.checkUploadList = function(username, repo, branch, basePath, index) {
        var i, complete = true, list = $scope.uploadList;

        for (i = 0; i < list.length; i++) {
            if (list[i].stat === 0 || list[i].stat > 1 && list[i].stat < 4) {
                complete = false;
                break;
            }
        }

        if (complete) {
            var tree = [];
            list.forEach(function(info) {
                tree.push({
                    path: info.name.substr(basePath.length),
                    mode: '100644',
                    type: 'blob',
                    sha: info.sha
                });
            });

            github.ng(github.gitdata.createTree, {
                user: username,
                repo: repo,
                tree: tree
            }).then(function(info) {
                var sha = info.sha;
                $scope.getRef(username, repo, branch, function(headsSha) {
                    $scope.createCommit(username, repo, branch, 'Set theme', sha, headsSha, index);
                });
            }, function() {
                $rootScope.loading = {
                    show: false
                };

                showMessageBox('Create git data tree failed, please try again later.', 'error', [{
                    text: 'OK',
                    action: function() {
                        closeMessageBox();
                        $rootScope.$broadcast('showAccountBox', 'GitHub');
                    }
                }]);
            });
        }
    };

    $scope.getRef = function(username, repo, branch, callback) {
        github.ng(github.gitdata.getReference, {
            user: username,
            repo: repo,
            ref: 'heads/' + branch
        }).then(function(info) {
            callback(info.object.sha);
        }, function() {
            $rootScope.loading = {
                show: false
            };

            showMessageBox('Get path reference failed, please try again later.', 'error', [{
                text: 'OK',
                action: function() {
                    closeMessageBox();
                    $rootScope.$broadcast('showAccountBox', 'GitHub');
                }
            }]);
        });
    };

    $scope.createCommit = function(username, repo, branch, message, tree, heads, index) {
        github.ng(github.gitdata.createCommit, {
            user: username,
            repo: repo,
            message: message,
            tree: tree,
            parents: [heads]
        }).then(function(info) {
            var sha = info.sha;

            github.ng(github.gitdata.updateReference, {
                user: username,
                repo: repo,
                ref: 'heads/' + branch,
                sha: sha,
                force: true
            }).then(function() {
                $scope.newPath[index] = false;
                $scope.pathNameErr[index] = false;
                $scope.pathName[index] = '';

                $scope.addRepo(username, repo);

                $rootScope.loading = {
                    show: false
                };

                showMessageBox('Create path succeed!', 'succeed', [{
                    text: 'OK',
                    action: function() {
                        closeMessageBox();
                    }
                }]);
            }, function() {
                $rootScope.loading = {
                    show: false
                };

                showMessageBox('Set git head failed, please try again later.', 'error', [{
                    text: 'OK',
                    action: function() {
                        closeMessageBox();
                        $rootScope.$broadcast('showAccountBox', 'GitHub');
                    }
                }]);
            });
        }, function() {
            $rootScope.loading = {
                show: false
            };

            showMessageBox('Create commit failed, please try again later.', 'error', [{
                text: 'OK',
                action: function() {
                    closeMessageBox();
                    $rootScope.$broadcast('showAccountBox', 'GitHub');
                }
            }]);
        });
    };
    
    $scope.openWebPage = function(url) {
        shell.openExternal(url);
    };

    $scope.close = function() {
        $rootScope.accountBox = {
            show: false
        };
    };

    $rootScope.accounts = storage.get('accounts') || {
        github: [],
        dropbox: {},
        onedrive: {}
    };

    $rootScope.repos = storage.get('repos') || [];

    $scope.addAccount = function() {
        $scope.showAccountField = true;
    };

    $scope.hideAccountField = function() {
        $scope.showAccountField = false;
    };

    $scope.addGitHubAccount = function() {
        var token = $scope.githubAccount.token,
            repo = $scope.githubAccount.repo;

        if (!token) {
            return;
        }

        $scope.githubAccount = {
            token: ''
        };

        $scope.showAccountField = false;

        $rootScope.loadingText = {
            text: 'Getting account information...'
        };

        $rootScope.loading = {
            show: true
        };

        github.authenticate({
            type: 'oauth',
            token: token
        });

        github.ng(github.user.get, {}).then(function(userInfo) {
            $rootScope.loading = {
                show: false
            };

            var i, existUser = false;

            for (i = 0; i < $rootScope.accounts.github.length; i++) {
                if ($rootScope.accounts.github[i].username === userInfo.login) {
                    $rootScope.accounts.github[i].token = token;
                    existUser = true;
                    break;
                }
            }

            if (!existUser) {
                $rootScope.accounts.github.push({
                    username: userInfo.login,
                    token: token,
                    repos: []
                });
            }

            storage.set('accounts', $rootScope.accounts);

            showMessageBox('Would you like to scan Jekyll repositories for this account?', 'help', [{
                text: 'OK',
                action: function() {
                    $scope.getRepoList(userInfo.login)
                    closeMessageBox();
                }
            }, {
                text: 'No, I\'d like to do that later',
                action: function() {
                    closeMessageBox();
                }
            }]);
        }, function(err) {
            $rootScope.loading = {
                show: false
            };
            showMessageBox(err.message, 'error');
        });
    };

    $scope.getRepoList = function(username, page) {
        page = page || 1;

        if (page === 1) {
            $scope.clearRepo(username);
        }

        $rootScope.loadingText = {
            text: 'Loading repository list...'
        };

        $rootScope.loading = {
            show: true
        };

        github.ng(github.repos.getAll, {
            type: 'owner',
            page: page
        }).then(function(repoList) {
            $scope.checkJekyllRepo(username, repoList, page);
        }, function(err) {
            $rootScope.loading = {
                show: false
            };

            showMessageBox(err.message, 'error');
        });
    };

    $scope.getRepoContent = function(username, repo, branch, path, succeed, fail) {
        github.ng(github.repos.getContent, {
            user: username,
            repo: repo,
            path: path,
            ref: branch
        }).then(succeed, fail);
    };

    $scope.checkJekyllRepo = function(username, repoList, page, index) {
        index = index || 0;

        if (index >= repoList.length) {
            if (repoList.length === 30) {
                $scope.getRepoList(username, page + 1);
            } else {
                $rootScope.loading = {
                    show: false
                };
                storage.set('accounts', $rootScope.accounts);
                showMessageBox('Update repository list succeed.', 'succeed');
            }
            return;
        }

        $rootScope.loadingText = {
            text: 'Checking ' + repoList[index].full_name + '...'
        };

        var repo = repoList[index].name, branch = 'gh-pages';

        if ((username + '.github.com').toLowerCase() === repo.toLowerCase() ||
                (username + '.github.io').toLowerCase() === repo.toLowerCase()) {
            branch = 'master';
        }

        $scope.getRepoContent(username, repo, branch, '', function(contentList) {
            var i, jekyllFile = {
                _config_yml: false,
                _posts: true,   // empty site has no _posts dir
                _layouts: false
            };

            for (var i = 0; i < contentList.length; i++) {
                if (contentList[i].name === '_config.yml' && contentList[i].type === 'file') {
                    jekyllFile._config_yml = true;
                } else if (contentList[i].name === '_posts' && contentList[i].type === 'dir') {
                    jekyllFile._posts = true;
                } else if (contentList[i].name === '_layouts' && contentList[i].type === 'dir') {
                    jekyllFile._layouts = true;
                }
            }

            if (jekyllFile._config_yml && jekyllFile._posts && jekyllFile._layouts) {
                $scope.addRepo(username, repo);
            }

            $scope.checkJekyllRepo(username, repoList, page, index + 1);
        }, function(err) {
            if (err.code !== 404) {
                $rootScope.loading = {
                    show: false
                };

                showMessageBox(err.message, 'error');
            } else {
                $scope.checkJekyllRepo(username, repoList, page, index + 1);
            }
        });
    };

    $scope.clearRepo = function(username) {
        var i, j, existRepo = false;
        for (i = 0; i < $rootScope.repos.length; i++) {
            if ($rootScope.repos[i].username === username) {
                $rootScope.repos.splice(i, 1);
                i--;
            }
        }

        storage.set('repos', $rootScope.repos);

        for (i = 0; i < $rootScope.accounts.github.length; i++) {
            if ($rootScope.accounts.github[i].username === username) {
                $rootScope.accounts.github[i].repos = [];
                break;
            }
        }

        storage.set('accounts', $rootScope.accounts);
    };

    $scope.addRepo = function(username, repo) {
        var i, j, existRepo = false;
        for (i = 0; i < $rootScope.repos.length; i++) {
            if ($rootScope.repos[i].username === username && $rootScope.repos[i].repo === repo) {
                existRepo = true;
                break;
            }
        }

        if (!existRepo) {
            var repoAccount = username +
                    ((username + '.github.com').toLowerCase() === repo.toLowerCase() ||
                        (username + '.github.io').toLowerCase() === repo.toLowerCase() ?
                    '' : '_' + repo),

                repoName = username +
                    ((username + '.github.com').toLowerCase() === repo.toLowerCase() ||
                        (username + '.github.io').toLowerCase() === repo.toLowerCase() ?
                    '' : '/' + repo);
            
            if (repoName === username) {
                $rootScope.repos.unshift({
                    username: username,
                    repo: repo,
                    account: repoAccount,
                    name: repoName
                });
            } else {
                $rootScope.repos.push({
                    username: username,
                    repo: repo,
                    account: repoAccount,
                    name: repoName
                });
            }
        }

        for (i = 0; i < $rootScope.accounts.github.length; i++) {
            if ($rootScope.accounts.github[i].username === username) {
                for (j = 0; j < $rootScope.accounts.github[i].repos.length; j++) {
                    if ($rootScope.accounts.github[i].repos[j] === repo) {
                        existRepo = true;
                        break;
                    }
                }

                if (!existRepo) {
                    if ((username + '.github.com').toLowerCase() === repo.toLowerCase() ||
                        (username + '.github.io').toLowerCase() === repo.toLowerCase()) {
                        repo = '';
                    }
                    
                    if (repo) {
                        $rootScope.accounts.github[i].repos.push('/' + repo);
                    } else {
                        $rootScope.accounts.github[i].repos.unshift('/' + repo);
                    }
                }

                break;
            }
        }

        storage.set('repos', $rootScope.repos);
    };

    $scope.removeGitHubAccountConfirm = function(username) {
        showMessageBox('Are you sure you want to remove ' + username + ' from the list?', 'help', [{
            text: 'Yes',
            action: function() {
                $scope.removeGitHubAccount(username);
                closeMessageBox();
            }
        }, {
            text: 'No',
            action: closeMessageBox
        }]);
    };

    $scope.removeGitHubAccount = function(username) {
        var i;
        for (i = 0; i < $rootScope.accounts.github.length; i++) {
            if ($rootScope.accounts.github[i].username === username) {
                $rootScope.accounts.github.splice(i, 1);
                break;
            }
        }

        storage.set('accounts', $rootScope.accounts);

        for (i = 0; i < $rootScope.repos.length; i++) {
            if ($rootScope.repos[i].username === username) {
                $rootScope.repos.splice(i, 1);
                i--;
            }
        }

        storage.set('repos', $rootScope.repos);
    };

    $scope.updateRepo = function(username, token) {
        showMessageBox('Would you like to update repositories for ' + username + ' now?' ,'help', [{
            text: 'Yes',
            action: function() {
                github.authenticate({
                    type: 'oauth',
                    token: token
                });

                $scope.getRepoList(username);
                closeMessageBox();
            }
        }, {
            text: 'No',
            action: closeMessageBox
        }]);
    };

    $scope.removeDropboxAccountConfirm = function() {
        showMessageBox('Are you sure you want to remove ' + $rootScope.accounts.dropbox.username + '?', 'help', [{
            text: 'Yes',
            action: function() {
                $rootScope.accounts.dropbox = {};
                storage.set('accounts', $rootScope.accounts);
                closeMessageBox();
            }
        }, {
            text: 'No',
            action: closeMessageBox
        }]);
    };

    $scope.addDropboxAccount = function() {
        var code = $scope.dropboxAccount.code;

        if (!code) {
            return;
        }

        $scope.dropboxAccount = {
            code: ''
        };

        $scope.showAccountField = false;

        $rootScope.loadingText = {
            text: 'Getting token...'
        };

        $rootScope.loading = {
            show: true
        };

        dropbox.getToken(code, function(err, res) {
            if (err) {
                $rootScope.loading = {
                    show: false
                };

                showMessageBox(err.message, 'error');
            } else {
                $rootScope.accounts.dropbox.token = res.access_token;
                $scope.getDropboxUserInfo();
            }
        });
    };

    $scope.getDropboxUserInfo = function() {
        $rootScope.loadingText = {
            text: 'Getting account information...'
        };

        dropbox.getInfo(function(err, res) {
            if (err) {
                $rootScope.loading = {
                    show: false
                };

                showMessageBox(err.message, 'error');
            } else {
                $rootScope.accounts.dropbox.id = res.uid;
                $rootScope.accounts.dropbox.username = res.display_name;
                $rootScope.accounts.dropbox.quota = res.quota_info;

                storage.set('accounts', $rootScope.accounts);

                $rootScope.loading = {
                    show: false
                };

                showMessageBox($rootScope.accounts.dropbox.username + ' has been added.', 'succeed');
            }
        });
    };

    $scope.removeQiniuAccountConfirm = function() {
        showMessageBox('Are you sure you want to remove ' + $rootScope.accounts.qiniu.bucket + '?', 'help', [{
            text: 'Yes',
            action: function() {
                $rootScope.accounts.qiniu = {};
                storage.set('accounts', $rootScope.accounts);
                closeMessageBox();
            }
        }, {
            text: 'No',
            action: closeMessageBox
        }]);
    };

    $scope.addQiniuAccount = function() {
        var bucket = $scope.qiniuAccount.bucket,
            baseUrl = $scope.qiniuAccount.baseUrl,
            access = $scope.qiniuAccount.access,
            secret = $scope.qiniuAccount.secret;

        if (!bucket || !baseUrl || !access || !secret) {
            return;
        }

        $scope.showAccountField = false;

        $rootScope.accounts.qiniu = {
            bucket: bucket,
            baseUrl: baseUrl,
            access: access,
            secret: secret
        };

        storage.set('accounts', $rootScope.accounts);
    };
})
.controller('picture', function($scope, $rootScope, $timeout, showMessageBox, file, dropbox, qiniu) {
    $rootScope.picture = {
        show: false
    };

    $scope.close = function() {
        $rootScope.picture = {
            show: false
        };
    };

    $scope.chooseImage = function(provider) {
        dialog.showOpenDialog({
            properties: ['openFile'],
            filters: [{ name:
                'Images',
                extensions: ['jpg', 'jepg', 'png', 'gif', 'bmp', 'svg', 'webp']
            }]
        }, function(file) {
            if (file) {
                $rootScope.loadingText = {
                    text: 'Uploading image...'
                };

                $rootScope.loading = {
                    show: true
                };

                switch (provider) {
                    case 'dropbox': {
                        $scope.uploadToDropbox(file[0].replace(/\\/g, '/'));
                        break;
                    }

                    case 'qiniu': {
                        $scope.uploadToQiniu(file[0].replace(/\\/g, '/'));
                        break;
                    }
                }
            }
        });
    };

    $scope.uploadToDropbox = function(path) {
        var fileName = path.split('/').pop(),
            title = fileName.split('.'),
            data = new Blob([file.read(path)]);

        title.pop();
        title = title.join('.');
        
        dropbox.setToken($rootScope.accounts.dropbox.token);
        dropbox.uploadPublicFile(fileName, data, function(err, res) {
            if (err) {
                $rootScope.loading = {
                    show: false
                };

                showMessageBox(err, 'error');
            } else {
                $scope.insert(title, res.url);
                $('#imagePath').val('');
            }
        });
    };

    $scope.uploadToQiniu = function(path) {
        var fileName = path.split('/').pop(),
            title = fileName.split('.'),
            data = new Blob([file.read(path)]);

        title.pop();
        title = title.join('.');

        qiniu.init($rootScope.accounts.qiniu.bucket, $rootScope.accounts.qiniu.access, $rootScope.accounts.qiniu.secret);
        qiniu.uploadFile(fileName, data, function(err, res) {
            if (err) {
                $rootScope.loading = {
                    show: false
                };

                showMessageBox(err, 'error');
            } else {
                $scope.insert(title, $rootScope.accounts.qiniu.baseUrl + res.key);
                $('#imagePath').val('');
            }
        });
    };

    $scope.$on('insertImage', function(event, title, url) {
        $scope.insert(title, url);
    });

    $scope.insert = function(title, url) {
        var pic, start = $('#editorContent')[0].selectionStart,
            end = $('#editorContent')[0].selectionEnd,
            len = $('#editorContent').val().length,
            before = $rootScope.postContent.value.substring(0, start),
            after = $rootScope.postContent.value.substring(end, len),
            currentScrollTop = $('#editor').scrollTop();

        title = title || 'Image Title';
        url = url || 'http://';

        before += Array(start - before.length + 1).join('\n');
        after = Array(len - end - after.length).join('\n') + after;

        pic = '![' + title + '](' + url + ')';

        $rootScope.postContent.value = before + pic + after;

        $timeout(function() {
            $('#editorContent')[0].selectionStart = start + pic.length;
            $('#editorContent')[0].selectionEnd = start + pic.length;

            autosize.update($('#editorContent'));

            $rootScope.loading = {
                show: false
            };

            $rootScope.picture = {
                show: false
            };

            $('#editorContent').focus();
            $('#editor').scrollTop(currentScrollTop);
        }, 100);
    };
})
.controller('tex', function($scope, $rootScope, $timeout, trim) {
    $rootScope.texbox = {
        show: false
    };

    $scope.init = function() {
        var script = document.createElement('script');
        script.src = 'node_modules/mathjax/MathJax.js?config=TeX-AMS-MML_HTMLorMML';
        document.body.appendChild(script);

        script.onload = function() {
            MathJax.Hub.Config({
                showMathMenu: false,
                messageStyle: 'none'
            });
            $scope.queue = MathJax.Hub.queue;
            $scope.math = null;

            $scope.queue.Push(function () {
                $scope.math = MathJax.Hub.getAllJax('MathOutput')[0];
            });
        };
    };

    $scope.updateMath = function () {
        $scope.queue.Push(['Text', $scope.math, '\\displaystyle{' + $('#mathInput').val() + '}']);
    };

    $scope.close = function() {
        $rootScope.texbox = {
            show: false
        };
    };

    $scope.insertMath = function() {
        var tex = trim($('#mathInput').val()),
            url = 'https://math.jekyllwriter.com/?q=' + encodeURIComponent(tex);

        if (!tex) {
            return;
        }

        $('#mathInput').val('');
        $scope.updateMath();
        $scope.close();

        $rootScope.$broadcast('insertImage', 'TeX', url);
    };
})
.controller('proxy', function($scope, $rootScope, file, showMessageBox, closeMessageBox) {
    var proxyConfig;

    $rootScope.proxyBox = {
        show: false
    };

    try {
        proxyConfig = file.read(_userdata + '/proxy.conf');
        proxyConfig = JSON.parse(proxyConfig);

        if (proxyConfig.type && proxyConfig.server && proxyConfig.port) {
            $scope.config = proxyConfig;
        } else {
            $scope.config = {
                type: 'direct',
                server: '',
                port: ''
            };
        }
    } catch(e) {
        $scope.config = {
            type: 'direct',
            server: '',
            port: ''
        };
    }

    $scope.close = function() {
        $rootScope.proxyBox = {
            show: false
        };
    };

    $scope.save = function() {
        if (!$scope.config.server && $scope.config.type !== 'direct') {
            showMessageBox('Server is required.', 'error');
            return;
        }

        if ($scope.config.type === 'direct') {
            proxyConfig = {};
        } else {
            if (!$scope.config.port) {
                switch ($scope.config.config.type) {
                    case 'http':
                        $scope.config.port = 80;
                        break;
                    case 'https':
                        $scope.config.port = 443;
                        break;
                    case 'socks4':
                    case 'socks5':
                        $scope.config.port = 1080;
                        break;
                }
            } else {
                $scope.config.port = Number($scope.config.port);
            }

            proxyConfig = $scope.config;
        }

        proxyConfig = JSON.stringify(proxyConfig);

        file.write(_userdata + '/proxy.conf', proxyConfig);

        showMessageBox('Relaunch Jekyll Writer to make proxy configure into effect.', 'info', [{
            text: 'OK',
            action: function() {
                closeMessageBox();

                $rootScope.proxyBox = {
                    show: false
                };
            }
        }]);
    };
});