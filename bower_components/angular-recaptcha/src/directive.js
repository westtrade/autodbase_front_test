/*global angular, Recaptcha */
(function (ng, Recaptcha) {
    'use strict';

    var app = ng.module('vcRecaptcha');

    app.directive('vcRecaptcha', ['$log', '$timeout', 'vcRecaptchaService', function ($log, $timeout, vcRecaptchaService) {

        return {
            restrict: 'A',
            require: 'ngModel',
            link: function (scope, elm, attrs, ctrl) {

                // $log.info("Creating recaptcha with theme=%s and key=%s", attrs.theme, attrs.key);

                if (!attrs.hasOwnProperty('key') || attrs.key.length !== 40) {
                    throw 'You need to set the "key" attribute to your public reCaptcha key. If you don\'t have a key, please get one from https://www.google.com/recaptcha/admin/create';
                }

                var
                    inputs, response, challenge,
                    refresh = function () {
                        ctrl.$setViewValue({response: response.val(), challenge: challenge.val()});
                    },
                    reload = function () {
                        inputs    = elm.find('input');
                        challenge = angular.element(inputs[0]); // #recaptcha_challenge_field
                        response  = angular.element(inputs[1]); // #recaptcha_response_field
                        refresh();
                    },
                    callback = function () {
                        // $log.info('Captcha rendered');

                        reload();

                        response.bind('keyup', function () {
                            scope.$apply(refresh);
                        });

                        // model -> view
                        ctrl.$render = function () {
                            response.val(ctrl.$viewValue.response);
                            challenge.val(ctrl.$viewValue.challenge);
                        };

                        // Capture the click even when the user requests for a new captcha
                        // We give some time for the new captcha to render
                        // This is kind of a hack, we should think on a better way to do this
                        // Probably checking for the image to change and if not, trigger the timeout again
                        elm.bind('click', function () {
                            // $log.info('clicked');
                            $timeout(function () {
                                scope.$apply(reload);
                            }, 1000);
                        });
                    },
                    reloadHandler = Recaptcha.reload;

                vcRecaptchaService.create(
                    elm[0],
                    attrs.key,
                    callback,
                    {
                        tabindex: attrs.tabindex,
                        theme:    attrs.theme,
                        lang:     attrs.lang || null
                    }
                );
            }
        };
    }]);

}(angular, Recaptcha));
