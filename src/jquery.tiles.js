/*
 * in4m tiles 2.0
 * 01-07-2014
 */
(function ($) {
    var cntDefaultStyles = function(cnt, settings)
    {
        cnt.css({position: 'relative'});
        cnt.css({padding:0});
        cnt.addClass(settings.containerClass);
    };
    var itemsDefaultStyles = function(cnt, settings)
    {
        var items = cnt.find(settings.itemsSelector);
        items.css({margin:0, height: "auto"});
    };

    var getPluginParams = function(cnt, settings)
    {
        var elem = cnt[0];
        if (typeof elem._in4mTiles === "undefined") {
            elem._in4mTiles = {
                calls: 1,
                settings: {
                    width: 0,
                    margin: 10,
                    itemsSelector: '.item',
                    containerClass: 'in4m-tiles',
                    center: true,
                    mobileVersion: true,
                    mobileMaximum: 0,
                    type: 'fill', // fill / normal / grid
                    maxWidth: 0,
                    minWidth: 0
                }
            };
        } else {
            elem._in4mTiles.calls++;
        }
        console.log(elem._in4mTiles.calls == 1 ? "first" : "not first");
        if (settings) {
            elem._in4mTiles.settings = $.extend(elem._in4mTiles.settings, settings);
        }
        prepareSettings(elem._in4mTiles.settings);
        return elem._in4mTiles;
    };
    var prepareSettings = function(settings)
    {
        if (settings.mobileVersion) {
            if (settings.mobileMaximum) {
                settings.mobileWidth = Math.max(settings.width, settings.mobileMaximum);
            } else {
                settings.mobileWidth = settings.width;
            }
        }
        settings.mod = settings.maxWidth > settings.minWidth && settings.minWidth > 0 ? 1 : 0;
    };

    $.fn.in4mTILES = function (params) {
        return this.each(function () {
            var obj = $(this);
            var pluginParams = getPluginParams(obj, params);
            var settings = pluginParams.settings;
            cntDefaultStyles(obj, settings);
            itemsDefaultStyles(obj, settings);

            var containerWidth = 0;
            var colsNumber = 0;
            var offsetLeft = 0;
            var positions = [];
            var items = obj.find(settings.itemsSelector);
            var res = false;
            items.css({width: settings.width, marginLeft: settings.margin, marginBottom: settings.margin});
            var countColumns = function () {
                items = obj.find(settings.itemsSelector);
                containerWidth = obj.innerWidth();
                colsNumber = Math.floor((containerWidth + settings.margin) / (settings.width + settings.margin));
                colsNumber = Math.max(colsNumber, 1);
                colsNumber = Math.min(items.length, colsNumber);
            };
            var countItemWidth = function () {
                containerWidth = obj.innerWidth();
                var pod = (containerWidth + settings.margin) % (settings.maxWidth + settings.margin);
                if (pod > 0) {
                    pod = (containerWidth + settings.margin) % (settings.minWidth + settings.margin);
                    var cCount = Math.floor((containerWidth + settings.margin) / (settings.minWidth + settings.margin));
                    if (cCount > 0) {
                        settings.width = settings.minWidth + pod / cCount;
                        if (settings.width > settings.maxWidth) {
                            settings.width = settings.maxWidth;
                        }
                    } else {
                        settings.width = settings.minWidth;
                    }
                } else {
                    settings.width = settings.maxWidth;
                }
            };
            var countColsExt;
            if (settings.center) {
                countColsExt = function () {
                    countColumns();
                    offsetLeft = (containerWidth - (colsNumber * (settings.width + settings.margin) - settings.margin)) / 2;
                };
            } else {
                countColsExt = function () {
                    countColumns();
                };
            }
            var recalculateValues = function () {
                if (settings.mod === 1) {
                    countItemWidth();
                }
                countColsExt();
                if (settings.mobileVersion && containerWidth < settings.mobileWidth) {
                    items.css({position: 'relative', width: '100%', margin: '0 0 ' + settings.margin + "px"});
                } else {
                    items.css({position: 'absolute', width: settings.width, margin: 0});

                }
            };
            var execute = function (obj) {
                console.log("exec");
                var i;
                recalculateValues();
                if (settings.mobileVersion && containerWidth < settings.mobileWidth) {
                    obj.find(settings.itemsSelector).css({top: '', left: '', height: ''});
                    obj.find(settings.itemsSelector).last().css('margin', 0);
                    obj.css('height', '');
                } else {
                    for (i = 0; i < colsNumber; i++) {
                        positions[i] = 0;
                    }
                    var col = 0;
                    if (settings.type === 'grid') {
                        var rows = items.length / colsNumber;
                        for (i = 0; i < rows; i++) {
                            var maxHeight = 0;
                            var j;
                            for (j = 0; j < colsNumber; j++) {
                                items.eq((i * colsNumber) + j).css('height', '');
                                var height = items.eq((i * colsNumber) + j).innerHeight();
                                if (height > maxHeight) maxHeight = height;
                            }
                            for (j = 0; j < colsNumber; j++) {
                                items.eq((i * colsNumber) + j).css('height', maxHeight);
                            }
                        }
                        items.each(function () {
                            var itemTop = positions[col];
                            var itemLeft = col * (settings.width + settings.margin) + offsetLeft;
                            positions[col] += $(this).outerHeight() + settings.margin;
                            col++;
                            if (col >= colsNumber) {
                                col = 0;
                            }
                            $(this).css({top: itemTop + "px", left: itemLeft + "px"});
                        });
                    } else if (settings.type === 'fill') {


                        items.each(function () {
                            var itemTop = positions[col];
                            var itemLeft = col * (settings.width + settings.margin) + offsetLeft;
                            positions[col] += $(this).outerHeight() + settings.margin;
                            $(this).css({top: itemTop + "px", left: itemLeft + "px"});
                            var min = positions[col];
                            for (var i = colsNumber - 1; i >= 0; i--) {
                                if (positions[i] <= min) {
                                    min = positions[i];
                                    col = i;
                                }
                            }
                        });
                    } else {
                        items.each(function () {
                            var itemTop = positions[col];
                            var itemLeft = col * (settings.width + settings.margin) + offsetLeft;
                            positions[col] += $(this).outerHeight() + settings.margin;
                            col++;
                            if (col >= colsNumber)
                                col = 0;

                            $(this).css({top: itemTop + "px", left: itemLeft + "px"});
                        });
                    }
                    var max = 0;
                    for (i = 0; i < colsNumber; i++) {
                        if (positions[i] > max)
                            max = positions[i];
                    }
                    obj.css('height', max - settings.margin);
                }
            };
            if (pluginParams.calls == 1) {
                $(window).on("resize", function () {
                    clearTimeout(res);
                    res = setTimeout(function () {
                        execute(obj);
                    }, 100);
                });
                obj.find(settings.itemsSelector).on('resize', function () {
                    clearTimeout(res);
                    res = setTimeout(function () {
                        execute(obj);
                    }, 10);
                }).on('remove', function () {
                    clearTimeout(res);
                    res = setTimeout(function () {
                        execute(obj);
                    }, 10);
                });
                obj.bind('DOMSubtreeModified', function(){
                    execute(obj);
                })
            }
            execute(obj);
            items.css('opacity', 1);
        });

    };
}(jQuery));