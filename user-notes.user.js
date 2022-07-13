// ==UserScript==
// @name        User-Notes
// @version     1.0.0
// @author      holzmaster
// @namespace   holzmaster
// @include     https://pr0gramm.com*
// @updateURL   https://holzmaster.github.io/user-notes/user-notes.user.js
// @downloadURL https://holzmaster.github.io/user-notes/user-notes.user.js
// @icon        https://pr0gramm.com/media/pr0gramm-favicon.png
// @grant       none
// ==/UserScript==

(function () {
    const s = document.createElement('script');
    s.appendChild(document.createTextNode('(' + main.toString() + ')();'));
    (document.body || document.head || document.documentElement).appendChild(s);

    function main() {
        function addGlobalStyle(css) {
            const style = document.createElement('style');
            style.innerHTML = css;
            document.head.appendChild(style);
        }

        const oldRender = p.View.User.prototype.render;
        p.View.User.prototype.render = function () {
            const res = oldRender.apply(this,
                arguments);
            initNotes(this.data.user.id, this.data.user.name);
            return res;
        };

        function getUserData(userId, userName) {
            const noteDataJson = localStorage.getItem('user-note-' + userId);
            const noteData = !!noteDataJson
                ? JSON.parse(noteDataJson)
                : {
                    id: userId,
                    names: [userName],
                    lastChanged: Date.now(),
                    content: '',
                    tags: [],
                };
            noteData.lastChanged = new Date(noteData);
            return noteData;
        }

        function saveUserData(current, userId, userName, content, tags) {
            const noteDataJson = JSON.stringify({
                id: current.userId ?? userId,
                names: [...new Set([...(current.names ?? []), userName])],
                lastChanged: new Date(),
                content: content ?? '',
                tags: tags ?? [],
            });
            localStorage.setItem('user-note-' + userId, noteDataJson);
            return noteDataJson;
        }

        function initNotes(userId, userName) {
            const $userHeading = $('h1.pane-head.user-head');
            const $noteField = $(`
                <textarea placeholder="Notiz zu ${userName}"></textarea>
            `);
            const $tagField = $(`
                <input type="text" placeholder="Tags zu ${userName}">
            `);

            $userHeading.after($noteField);
            $noteField.after($tagField);

            let noteData = getUserData(userId, userName);

            $noteField.val(noteData.content);
            $tagField.val(noteData.tags.join(', '));

            $noteField.on(
                'input',
                () => noteData = saveUserData(
                    noteData,
                    userId,
                    userName,
                    $noteField.val(),
                    $tagField.val().toLowerCase().split(',').map(t => t.trim()),
                ),
            );

            $tagField.on(
                'input',
                () => noteData = saveUserData(
                    noteData,
                    userId,
                    userName,
                    $noteField.val(),
                    $tagField.val().toLowerCase().split(',').map(t => t.trim())
                ),
            );
        }
    }
})();
