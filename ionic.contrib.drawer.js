(function () {

    'use strict';

    /**
    * The ionic-contrib-frosted-glass is a fun frosted-glass effect
    * that can be used in iOS apps to give an iOS 7 frosted-glass effect
    * to any element.
    */
    angular.module('ionic.contrib.drawer', ['ionic'])

.controller('drawerCtrl', ['$element', '$attrs', '$ionicGesture',
    '$document', '$window', '$scope', function ($element, $attr, $ionicGesture, $document, $window, $scope) {
    var el = $element[0];
    var dragging = false;
    var startX, lastX, offsetX, newX;
    var side;
    var checkFixedMediaQuery = $attr.fixedWhen == 'large' ? '(min-width:768px)' : $attr.fixedWhen || "";
    var contentEl = $element.parent().find("ion-side-menu-content")[0];

    var isDrawerFixed = false;
    var dragGesture, dragEndGesture;

    // How far to drag before triggering
    var thresholdX = 15;
    // How far from edge before triggering
    var edgeX = 40;

    var LEFT = 0;
    var RIGHT = 1;

    var isDrawerFixedOpen = false;
    var isTargetDrag = false;

    var width = $element[0].clientWidth;

    var enableAnimation = function () {
        $element.addClass('animate');
    };
    var disableAnimation = function () {
        $element.removeClass('animate');
    };

    // Check if this is on target or not
    var isTarget = function (el) {
        while (el) {
            if (el === $element[0]) {
                return true;
            }
            el = el.parentNode;
        }
    };

    var startDrag = function (e) {
        disableAnimation();

        dragging = true;
        offsetX = lastX - startX;
    };

    var startTargetDrag = function (e) {
        disableAnimation();

        dragging = true;
        isTargetDrag = true;
        offsetX = lastX - startX;
    };

    var doEndDrag = function (e) {
        startX = null;
        lastX = null;
        offsetX = null;
        isTargetDrag = false;

        if (!dragging) {
            return;
        }

        dragging = false;

        enableAnimation();

        ionic.requestAnimationFrame(function () {
            if (newX < (-width /*/ 2 */ )) {
                el.style.transform = el.style.webkitTransform = 'translate3d(' + -width + 'px, 0, 0)';
            } else {
                el.style.transform = el.style.webkitTransform = 'translate3d(0px, 0, 0)';
            }
        });
    };

    var doDrag = function (e) {
        if (e.defaultPrevented) {
            return;
        }

        if (!lastX) {
            startX = e.gesture.touches[0].pageX;
        }

        lastX = e.gesture.touches[0].pageX;

        if (!dragging) {

            // Dragged 15 pixels and finger is by edge
            if (Math.abs(lastX - startX) > thresholdX) {
                if (isTarget(e.target)) {
                    startTargetDrag(e);
                } else if (startX < edgeX) {
                    startDrag(e);
                }
            }
        } else {
            newX = Math.min(0, (-width + (lastX - offsetX)));
            ionic.requestAnimationFrame(function () {
                el.style.transform = el.style.webkitTransform = 'translate3d(' + newX + 'px, 0, 0)';
            });

        }

        if (dragging) {
            e.gesture.srcEvent.preventDefault();
        }
    };


    this.close = function () {
        if (isDrawerFixed)
            return;
        enableAnimation();
        ionic.requestAnimationFrame(function () {
            if (side === LEFT) {
                el.style.transform = el.style.webkitTransform = 'translate3d(-100%, 0, 0)';
            } else {
                el.style.transform = el.style.webkitTransform = 'translate3d(100%, 0, 0)';
            }
        });
    };

    this.open = function () {
        if (isDrawerFixed)
            return;

        enableAnimation();
        ionic.requestAnimationFrame(function () {
            if (side === LEFT) {
                el.style.transform = el.style.webkitTransform = 'translate3d(0%, 0, 0)';
            } else {
                el.style.transform = el.style.webkitTransform = 'translate3d(0%, 0, 0)';
            }
        });
    };

    side = $attr.side == 'left' ? LEFT : RIGHT;

    function checkExpose() {
        isDrawerFixed = $window.matchMedia(checkFixedMediaQuery).matches;

        if (isDrawerFixed) {
            if (dragGesture) {
                $ionicGesture.off(dragGesture, 'drag', doDrag);
                $ionicGesture.off(dragEndGesture, 'dragend', doEndDrag);
            }

            el.style.transform = el.style.webkitTransform = 'none';
            contentEl.style.left = "auto";
            contentEl.style.width = "calc(100% - " + $element[0].clientWidth + "px)";
        } else {
            dragGesture = $ionicGesture.on('drag', doDrag, $document);
            dragEndGesture = $ionicGesture.on('dragend', doEndDrag, $document);

            el.style.transform = el.style.webkitTransform = '';
            contentEl.style.left = "0";
            contentEl.style.width = "100%";
        }
    }
    checkExpose();

    if (checkFixedMediaQuery) {
        var debouncedCheck = ionic.debounce(function () {
            $scope.$apply(function () {
                checkExpose();
            });
        }, 300, false);


        ionic.on('resize', debouncedCheck, $window);
        $scope.$on('$destroy', function () {
            ionic.off('resize', debouncedCheck, $window);
        });
    }

} ])

.directive('drawer', ['$rootScope', '$ionicGesture', function ($rootScope, $ionicGesture) {
    return {
        restrict: 'E',
        controller: 'drawerCtrl',
        link: function ($scope, $element, $attr, ctrl) {
            $element.addClass($attr.side);
            $scope.openDrawer = function () {                
                ctrl.open();
            };
            $scope.closeDrawer = function () {
                ctrl.close();
            };
        }
    }
} ])
.directive('drawerClose', ['$rootScope', function($rootScope) {
    return {
        restrict: 'A',
        link: function($scope, $element) {
            $element.bind('click', function() {
                var drawerCtrl = $element.inheritedData('$drawerController');
                drawerCtrl.close();
            });
        }
    }
}])

})();

