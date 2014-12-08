/*jslint regexp: true, evil: true, unparam: true, ass: true, nomen: true*/
/*jshint unused: true*/
/*global define, console*/

/**
 * Template manager module.
 * @requires {@link core/config}
 * @requires {@link core/event}
 * @requires {@link core/http}
 * @requires {@link core/window}
 * @namespace core/template
 * @memberof core
 */

define({
    name: 'core/template',
    requires: [
        'core/config',
        'core/event',
        'core/http',
        'core/window'
    ],
    def: function template(config, e, http, window) {
        'use strict';

        /**
         * Compiled template cache
         */
        var cache = {},
            document = window.document,
            loopVariablesRegex = /\{\{this(\..+?)?\}\}/g,
            loopIterationRegex = /\{\{i\}\}/g,
            whitespaceRegex = /[\r\t\n]/g,
            loopTemplateRegex = /\{\{#([\w]*)\}\}(.*)\{\{\/(\1)\}\}/ig,
            conditionTemplateRegex = null,
            variablesRegex = /\{\{(.+?)\}\}/g;

        /**
         * Regular expression matching template conditions.
         *
         * \{\{ -opening braces
         * \? -mandatory question mark at the start
         * (typeof\s|[^a-zA-Z0-9]*) -special stuff eg. !, typeof
         * (.+?) -any sequence of chars in the condition
         * \}\} - closing braces
         * (.*) -body
         * \{\{ - opening braces
         * \/ -backslash
         * (\1)(\2) -the same sequence as found before
         * \}\} -closing braces
         *
         * /ig -global, case-insensitive
         *
         */
        conditionTemplateRegex =
            /\{\{\?(typeof\s|[^a-zA-Z0-9]*)(.+?)\}\}(.*)\{\{\/(\1)(\2)\}\}/ig;

        /**
         * Generates code for template loops.
         * @param {string} match The matched substring.
         * @param {string} $1 First submatch (array variable).
         * @param {string} $2 Second submatch (body).
         * @return {string}
         */
        function templateLoop(match, $1, $2) {
            return '\';var i=0,l=data.' + $1 +
                '.length,d=data.' + $1 + ';for(;i<l;i++){s+=\'' +
                $2
                .replace(loopVariablesRegex, '\'+d[i]$1+\'')
                .replace(loopIterationRegex, '\'+i+\'') +
                '\'}s+=\'';
        }

        /**
         * Generates code for template conditions.
         * @param {string} match The matched substring.
         * @param {string} $1 First submatch (typeof, negation).
         * @param {string} $2 Second submatch (condition).
         * @param {string} $3 Third submatch (body).
         * @return {string}
         */
        function templateCondition(match, $1, $2, $3) {
            return '\';if(' + $1 + 'data.' + $2 + '){s+=\'' + $3 + '\'}s+=\'';
        }

        /**
         * Saves compiled template to cache.
         * @param {string} tplName Template name.
         * @param {function} tplData Template data.
         */
        function save(tplName, tplData) {
            cache[tplName] = tplData;
        }

        /**
         * Compiles a template.
         * @param {string} tplName Template name.
         * @param {string} template Template.
         * @return {function} Compiled template.
         * @throws {Error} Error in template syntax.
         */
        function compile(tplName, template) {
            var content = cache[tplName];

            if (!content) {
                // initialize empty string
                content = 'try { var s=\'\';s+=\'' +
                    // replace all weird whitespace with spaces
                    template.replace(whitespaceRegex, ' ')
                    .split('\'').join('\\\'') // escape quotes
                    .replace(
                        /**
                         * Handle loops.
                         *
                         * In the loop, 'i' is the key and 'this' is the value
                         *
                         * Example:
                         *     {{#arr}}<li>key:{{i}} value:{{this}}</li>{{/arr}}
                         */
                        loopTemplateRegex,
                        templateLoop
                    )
                    .replace(
                        /**
                         * Handle conditions.
                         *
                         * Example:
                         *     {{?logged}}Logged{{/logged}}
                         * becomes:
                         *     if(data.logged){s+='Logged'}
                         *
                         * Some of other possible conditions:
                         *     {{?!variable}}test{{/!variable}}
                         *     {{?typeof variable !== "undefined"}}
                         *         test
                         *     {{/typeof variable !== "undefined"}}
                         *     {{?variable === "value"}}
                         *         test
                         *     {{/variable === "value"}}
                         */
                        conditionTemplateRegex,
                        templateCondition
                    )
                       /**
                        * Handle other references by adding 'data.'.
                        *
                        * Example:
                        *     {{user.name}}
                        * becomes:
                        *     s+=data.user.name
                        *
                        * \{\{ -opening braces
                        * (.+?) -any sequence of characters
                        * \}\} -closing braces
                        *
                        * /g -global
                        *
                        */
                    .replace(variablesRegex, '\'+data.$1+\'') +
                        '\';return s;' + // return the string
                        '} catch (e) {' +
                        '    throw Error(\'Error in template ' + tplName +
                        ': \' + e.message); }';

                content = new Function('data', content);
                save(tplName, content);
            }

            return content;
        }

        /**
         * Loads a template using ajax.
         * @param {string} tplName Template name.
         * @param {object} [options] Options.
         * @param {boolean} [options.async=false] Async mode.
         * @param {function} [onSuccess] Success callback.
         * @return {function|undefined}
         */
        function loadOne(tplName, options, onSuccess) {
            var tplPath = [
                    config.get('templateDir'),
                    [tplName, config.get('templateExtension')].join('')
                ].join('/'),
                tplCompiled = null,
                async = null,
                onReqSuccess = null;

            options = options || {};
            async = typeof options.async === 'boolean' ? options.async : false;

            onReqSuccess = function onReqSuccess(data) {
                tplCompiled = compile(tplName, data);
                if (async === false) {
                    if (typeof onSuccess === 'function') {
                        onSuccess();
                    }
                }
            };

            http.request({
                url: tplPath,
                async: async,
                success: onReqSuccess,
                error: function error(textStatus) {
                    console.error(tplPath + ' loading error: ' + textStatus);
                }
            });

            if (async === false) {
                return tplCompiled;
            }
            return undefined;
        }

        /**
         * Loads templates.
         * @memberof core/template
         * @param {string[]} tplNames Template names.
         * @param {object} [options] Options.
         * @param {boolean} [options.async=false] Async mode.
         */
        function load(tplNames, options) {
            var cachedTemplates = 0,
                i = 0,
                onSuccess = function onSuccess() {
                    cachedTemplates += 1;
                    // if all templates are cached fire event
                    if (cachedTemplates >= tplNames.length) {
                        e.fire('loaded');
                    }
                };

            options = options || {};
            options.async = typeof options.async === 'boolean' ?
                    options.async : false;

            if (Array.isArray(tplNames)) {
                for (i = 0; i < tplNames.length; i += 1) {
                    loadOne(tplNames[i], options, onSuccess);
                }
            }
        }

        /**
         * Returns template completed by specified params.
         * @param {function} tplCompiled Compiled template.
         * @param {array|object} [tplParams] Template parameters.
         * @return {string} Completed template.
         */
        function getCompleted(tplCompiled, tplParams) {
            /*jshint validthis:true*/
            return tplCompiled.call(this, tplParams);
        }

        /**
         * Returns template in html format.
         * @memberof core/template
         *
         * @example
         * // Variable
         * // test.tpl content: {{foo}}
         * get('test', {foo: '123'}) // returns '123'
         *
         * @example
         * // Variables
         * // test.tpl content: {{foo}} {{bar}}
         * get('test', {foo: '123', bar: 456}) // returns '123 456'
         *
         * @example
         * // Object property
         * // test.tpl content: {{obj.prop}}
         * get('test', {obj: {prop: 'test'}}) // returns 'test'
         *
         * @example
         * // Array element
         * // test.tpl content: {{arr[0]}}
         * get('test', {arr: ['test']}) // returns 'test'
         *
         * @example
         * // Array loop
         * // test.tpl content: {{#arr}}{{i}}-{{this}} {{/arr}}
         * get('test', {arr: ['test', 'test2']}) // returns '0-test 1-test2 '
         *
         * @example
         * // Condition true
         * // test.tpl content: {{?variable}}test{{/variable}}
         * get('test', {variable: true}) // returns 'test'
         *
         * @example
         * // Condition false
         * // test.tpl content: {{?!variable}}test{{/!variable}}
         * get('test', {variable: false}) // returns 'test'
         *
         * @example
         * // Condition typeof
         * // test.tpl content:
         * // {{?typeof variable !== "undefined"}}
         * //     test
         * // {{/typeof variable !== "undefined"}}
         * get('test', {variable: 'value'}) // returns 'test'
         *
         * @example
         * // Condition variable
         * // test.tpl content:
         * // {{?variable === "value"}}test{{/variable === "value"}}
         * get('test', {variable: 'value'}) // returns 'test'
         *
         * @param {string} tplName Template name.
         * @param {string} [tplParams] Template parameters.
         * @return {string} Completed template.
         */
        function get(tplName, tplParams) {
            var tplCompiled = cache[tplName] || loadOne(tplName);
            return getCompleted(tplCompiled, tplParams);
        }

        /**
         * Returns first HTML element from completed template.
         * @memberof core/template
         * @param {string} tplName Template name.
         * @param {string} [tplParams] Template parameters.
         * @return {HTMLElement} First element from the completed template.
         */
        function getElement(tplName, tplParams) {
            var html = get(tplName, tplParams),
                tempElement = document.createElement('div');

            tempElement.innerHTML = html;
            return tempElement.firstChild;
        }

        /**
         * Returns completed template as DocumentFragment.
         * @memberof core/template
         * @param {string} tplName Template name.
         * @param {string} [tplParams] Template parameters.
         * @return {DocumentFragment} First element from the completed template.
         */
        function getAsFragment(tplName, tplParams) {
            var html = get(tplName, tplParams),
                tempElement = document.createElement('div'),
                fragment = document.createDocumentFragment();

            tempElement.innerHTML = html;

            while (tempElement.firstChild) {
                fragment.appendChild(tempElement.firstChild);
            }
            return fragment;
        }

        /**
         * Returns the compiled template.
         * @memberof core/template
         * @param {string} tplName Template name.
         * @return {function} Compiled template.
         */
        function getCompiled(tplName) {
            return cache[tplName] || loadOne(tplName);
        }

        return {
            load: load,
            getCompiled: getCompiled,
            getElement: getElement,
            getAsFragment: getAsFragment,
            get: get
        };
    }
});
