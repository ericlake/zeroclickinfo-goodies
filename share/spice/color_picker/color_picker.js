(function (env) {
    "use strict";
    env.ddg_spice_color_picker = function(){

        var initial_color = get_initial_color();
        var saturation_value_path = DDG.get_asset_path('color_picker', 'assets/saturation_value_gradient.png');
        var hue_path = DDG.get_asset_path('color_picker', 'assets/hue_gradient.png');
        var markers = get_marker_positions(initial_color.hsv);
        
        var data = {
            colors: initial_color,
            saturation_value_path: 'http://chrisharrill.com/images/saturation_value_gradient.png',
            hue_path: 'http://chrisharrill.com/images/hue_gradient.png',
            markers: markers
        }

        var templateObj = {
            detail: Spice.color_picker.content,
            item: Spice.color_picker.content,
            item_detail: false
        };

        var currentColor = initial_color;
        var saturation_value_mousedown = false;
        var hue_mousedown = false;

        function to_bounded_integer(value, lower_bound, upper_bound) {
            return Math.round(to_bounded_number(value, lower_bound, upper_bound));
        }

        function to_bounded_number(value, lower_bound, upper_bound) {
            var num = ~~Number(value);//TODO: this actually forces an integer
            if (num < lower_bound)
                num = lower_bound;
            if (num > upper_bound)
                num = upper_bound;
            return num;
        }

        function saturation_value_clicked(event) {
            var offset = $('#color_picker_container #saturation_value_picker').offset();
            var x = event.pageX - offset.left;
            var y = event.pageY - offset.top;

            var saturation = Math.floor((x / 256) * 100);
            var value = Math.floor(((256 - y) / 256) * 100);
            var hue = currentColor.hsv.hue;

            saturation = to_bounded_integer(saturation, 0, 100);
            value = to_bounded_integer(value, 0, 100);

            update_all_from_hsv(hue, saturation, value);
        }

        function hue_clicked(event) {
            var offset = $('#color_picker_container #hue_picker').offset();
            var y = event.pageY - offset.top;

            var hue = Math.floor((y / 256) * 360);
            var saturation = currentColor.hsv.saturation;
            var value = currentColor.hsv.value;

            hue = to_bounded_integer(hue, 0, 359);

            update_all_from_hsv(hue, saturation, value);
        }

        function red_change(event) {
            var red = $('#color_picker_container #red_input').val();
            var green = currentColor.rgb.green;
            var blue = currentColor.rgb.blue;

            red = to_bounded_integer(red, 0, 255);

            update_all_from_rgb(red, green, blue);
        }

        function green_change(event) {
            var red = currentColor.rgb.red;
            var green = $('#color_picker_container #green_input').val();
            var blue = currentColor.rgb.blue;

            green = to_bounded_integer(green, 0, 255);
            
            update_all_from_rgb(red, green, blue);
        }

        function blue_change(event) {
            var red = currentColor.rgb.red;
            var green = currentColor.rgb.green;
            var blue = $('#color_picker_container #blue_input').val();

            blue = to_bounded_integer(blue, 0, 255);
            
            update_all_from_rgb(red, green, blue);
        }

        function hue_change(event) {
            var hue = $('#color_picker_container #hue_input').val();
            var saturation = currentColor.hsv.saturation;
            var value = currentColor.hsv.value;

            hue = to_bounded_integer(hue, 0, 359);
            
            update_all_from_hsv(hue, saturation, value);
        }

        function saturation_change(event) {
            var hue = currentColor.hsv.hue;
            var saturation = $('#color_picker_container #saturation_input').val();
            var value = currentColor.hsv.value;

            saturation = to_bounded_integer(saturation, 0, 100);

            update_all_from_hsv(hue, saturation, value);
        }

        function value_change(event) {
            var hue = currentColor.hsv.hue;
            var saturation = currentColor.hsv.saturation;
            var value = $('#color_picker_container #value_input').val();

            value = to_bounded_integer(value, 0, 100);
            
            update_all_from_hsv(hue, saturation, value);
        }

        function cyan_change(event) {
            var cyan = $('#color_picker_container #cyan_input').val();
            var magenta = currentColor.cmyk.magenta;
            var yellow = currentColor.cmyk.yellow;
            var black = currentColor.cmyk.black;

            cyan = to_bounded_number(cyan, 0, 100);
            
            update_all_from_cmyk(cyan, magenta, yellow, black);
        }

        function magenta_change(event) {
            var cyan = currentColor.cmyk.cyan;
            var magenta = $('#color_picker_container #magenta_input').val();
            var yellow = currentColor.cmyk.yellow;
            var black = currentColor.cmyk.black;

            magenta = to_bounded_number(magenta, 0, 100);
            
            update_all_from_cmyk(cyan, magenta, yellow, black);
        }

        function yellow_change(event) {
            var cyan = currentColor.cmyk.cyan;
            var magenta = currentColor.cmyk.magenta;
            var yellow = $('#color_picker_container #yellow_input').val();
            var black = currentColor.cmyk.black;

            yellow = to_bounded_number(yellow, 0, 100);
            
            update_all_from_cmyk(cyan, magenta, yellow, black);
        }

        function black_change(event) {
            var cyan = currentColor.cmyk.cyan;
            var magenta = currentColor.cmyk.magenta;
            var yellow = currentColor.cmyk.yellow;
            var black = $('#color_picker_container #black_input').val();

            black = to_bounded_number(black, 0, 100);
            
            update_all_from_cmyk(cyan, magenta, yellow, black);
        }

        function hex_change(event) {
            var hex = $('#color_picker_container #hex_input').val();

            if (hex.charAt(0) === '#') hex = hex.substring(1);
            if (/^[0-9a-f]+$/i.test(hex)) {
                if (hex.length === 3)
                    hex = '0' + hex.charAt(0) + '0' + hex.charAt(1) + '0' + hex.charAt(2);
                if (hex.length === 6)
                    update_all_from_hex(hex);
                else
                    update_all_from_hex(currentColor.hex.substring(1));
            } else
                update_all_from_hex(currentColor.hex.substring(1));
        }

        function get_marker_positions(hsv) {
            var markers = {
                hue: {
                    y: Math.round((hsv.hue / 360) * 256) + 10
                },
                saturation_value: {
                    x: Math.round((hsv.saturation / 100) * 256) + 3,
                    y: 256 - Math.round((hsv.value / 100) * 256) + 10
                }
            }

            return markers;
        }

        function update_all_from_hsv(hue, saturation, value) {
            currentColor = get_all_colors_from_hsv(hue, saturation, value);
            markers = get_marker_positions(currentColor.hsv);
            update_all();
        }

        function update_all_from_rgb(red, green, blue) {
            currentColor = get_all_colors_from_rgb(red, green, blue);
            markers = get_marker_positions(currentColor.hsv);
            update_all();
        }

        function update_all_from_cmyk(cyan, magenta, yellow, black) {
            currentColor = get_all_colors_from_cmyk(cyan, magenta, yellow, black);
            markers = get_marker_positions(currentColor.hsv);
            update_all();
        }

        function update_all_from_hex(hex) {
            var rgb = convert_hex_to_rgb(hex);
            currentColor = get_all_colors_from_rgb(rgb.red, rgb.green, rgb.blue);
            markers = get_marker_positions(currentColor.hsv);
            update_all();
        }

        function get_all_colors_from_hsv(hue, saturation, value) {
            var hsv = {
                hue: hue,
                saturation: saturation,
                value: value
            };
            var rgb = convert_hsv_to_rgb(hue, saturation, value);
            var cmyk = convert_rgb_to_cmyk(rgb.red, rgb.green, rgb.blue);
            var hex = convert_rgb_to_hex(rgb.red, rgb.green, rgb.blue);
            var hex_hue = convert_hsv_to_hex(hue, 100, 100);

            var colors = {
                rgb: rgb,
                hsv: hsv,
                cmyk: cmyk,
                hex: hex,
                hex_hue: hex_hue
            };

            return colors;
        }

        function get_all_colors_from_rgb(red, green, blue) {
            var rgb = {
                red: red,
                green: green,
                blue: blue
            };
            var hsv = convert_rgb_to_hsv(red, green, blue);
            var cmyk = convert_rgb_to_cmyk(red, green, blue);
            var hex = convert_rgb_to_hex(red, green, blue);
            var hex_hue = convert_hsv_to_hex(hsv.hue, 100, 100);

            var colors = {
                rgb: rgb,
                hsv: hsv,
                cmyk: cmyk,
                hex: hex,
                hex_hue: hex_hue
            };

            return colors;
        }

        function get_all_colors_from_cmyk(cyan, magenta, yellow, black) {
            var cmyk = {
                cyan: cyan,
                magenta: magenta,
                yellow: yellow,
                black: black
            };
            var rgb = convert_cmyk_to_rgb(cyan, magenta, yellow, black);
            var hsv = convert_rgb_to_hsv(rgb.red, rgb.green, rgb.blue);
            var hex = convert_rgb_to_hex(rgb.red, rgb.green, rgb.blue);
            var hex_hue = convert_hsv_to_hex(hsv.hue, 100, 100);

            var colors = {
                rgb: rgb,
                hsv: hsv,
                cmyk: cmyk,
                hex: hex,
                hex_hue: hex_hue
            };

            return colors;
        }

        function update_all() {
            $('#red_input').val(currentColor.rgb.red);
            $('#green_input').val(currentColor.rgb.green);
            $('#blue_input').val(currentColor.rgb.blue);
            $('#hue_input').val(currentColor.hsv.hue);
            $('#saturation_input').val(currentColor.hsv.saturation);
            $('#value_input').val(currentColor.hsv.value);
            $('#cyan_input').val(currentColor.cmyk.cyan);
            $('#magenta_input').val(currentColor.cmyk.magenta);
            $('#yellow_input').val(currentColor.cmyk.yellow);
            $('#black_input').val(currentColor.cmyk.black);
            $('#hex_input').val(currentColor.hex);

            $('#saturation_value_picker').css('background-color', currentColor.hex_hue);
            $('#sample').css('background-color', currentColor.hex);

            $('#saturation_value_marker').css('top', markers.saturation_value.y);
            $('#saturation_value_marker').css('left', markers.saturation_value.x);
            $('#hue_marker').css('top', markers.hue.y);
        }

        function convert_hsv_to_rgb(hue, saturation, value) {
            var c = (value / 100) * (saturation / 100);
            var x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
            var m = (value / 100) - c;

            var red = 0, green = 0, blue = 0;
            switch (true) {
                case 0 <= hue && hue < 60:
                    red = c; green = x; blue = 0;
                    break;
                case 60 <= hue && hue < 120:
                    red = x; green = c; blue = 0;
                    break;
                case 120 <= hue && hue < 180:
                    red = 0; green = c; blue = x;
                    break;
                case 180 <= hue && hue < 240:
                    red = 0; green = x; blue = c;
                    break;
                case 240 <= hue && hue < 300:
                    red = x; green = 0; blue = c;
                    break;
                case 300 <= hue && hue < 360:
                    red = c; green = 0; blue = x;
                    break;
            }
            red = Math.floor(255 * (red + m));
            green = Math.floor(255 * (green + m));
            blue = Math.floor(255 * (blue + m));

            var rgb = {
                red: red,
                green: green,
                blue: blue
            }
            return rgb;
        }

        function convert_rgb_to_hsv(red, green, blue){
            var red_proportion = red / 255;
            var green_proportion = green / 255;
            var blue_proportion = blue / 255;
            
            var min = Math.min(red_proportion, Math.min(green_proportion, blue_proportion));
            var max = Math.max(red_proportion, Math.max(green_proportion, blue_proportion));
            var delta = max - min;
            
            var hue = 0;
            var saturation = (max > 0) ? Math.round(((max - min) * 100) / max) : 0;
            var value = Math.round(max * 100);
            if (delta > 0) {
                switch (max) {
                    case red_proportion:
                        hue = Math.round(60 * (((green_proportion - blue_proportion) / delta)));
                        break;
                    case green_proportion:
                        hue = Math.round(60 * (((blue_proportion - red_proportion) / delta) + 2));
                        break;
                    case blue_proportion:
                        hue = Math.round(60 * (((red_proportion - green_proportion) / delta) + 4));
                        break;
                }
            }
            if (hue < 0) hue += 360;
            
            var hsv = {
                hue: hue,
                saturation: saturation,
                value: value
            };

            return hsv;
        }

        function convert_rgb_to_cmyk(red, green, blue){
            var red_proportion = red / 255;
            var green_proportion = green / 255;
            var blue_proportion = blue / 255;
            
            var black = 1 - Math.max(red_proportion, Math.max(green_proportion, blue_proportion));
            var cyan = (black < 1) ? ((1 - red_proportion - black) / (1 - black)) : 0;
            var magenta = (black < 1) ? ((1 - green_proportion - black) / (1 - black)) : 0;
            var yellow = (black < 1) ? ((1 - blue_proportion - black) / (1 - black)) : 0;
            
            return {
                black: (100 * black).toFixed(1),
                cyan: (100 * cyan).toFixed(1),
                magenta: (100 * magenta).toFixed(1),
                yellow: (100 * yellow).toFixed(1)
            }
        }
    
        function convert_rgb_to_hex(red, green, blue){
            var red_string = red.toString(16);
            if (red_string.length < 2)
                red_string = '0' + red_string;
            var green_string = green.toString(16);
            if (green_string.length < 2)
                green_string = '0' + green_string;
            var blue_string = blue.toString(16);
            if (blue_string.length < 2)
                blue_string = '0' + blue_string;
            
            return '#' + red_string + green_string + blue_string;
        }

        function convert_hsv_to_hex(hue, saturation, value) {
            var rgb = convert_hsv_to_rgb(hue, saturation, value);
            var hex = convert_rgb_to_hex(rgb.red, rgb.green, rgb.blue);
            return hex;
        }

        function convert_hex_to_hsv(hex) {
            var rgb = convert_hex_to_rgb(hex);
            var hsv = convert_rgb_to_hsv(rgb.red, rgb.green, rgb.blue);
            return hsv;
        }

        function convert_hex_to_rgb(hex) {
            var red = parseInt(hex.substring(0,2), 16);
            var green = parseInt(hex.substring(2,4), 16);
            var blue = parseInt(hex.substring(4,6), 16);

            var rgb = {
                red: red,
                green: green,
                blue: blue
            };
            return rgb;
        }

        function convert_cmyk_to_rgb(cyan, magenta, yellow, black) {
            var c = cyan / 100;
            var m = magenta / 100;
            var y = yellow / 100;
            var k = black / 100;

            var red = Math.round(255 * (1 - c) * (1 - k));
            var green = Math.round(255 * (1 - m) * (1 - k));
            var blue = Math.round(255 * (1 - y) * (1 - k));

            var rgb = {
                red: red,
                green: green,
                blue: blue
            };
            return rgb;
        }
    
        function get_initial_color() {
            var hue = Math.floor(Math.random() * 100);
            var saturation = Math.floor(Math.random() * 100);
            var value = Math.floor(Math.random() * 100);

            var colors = get_all_colors_from_hsv(hue, saturation, value);

            return colors;
        };
    
        function is_integer(str) {
            var int_value = ~~Number(str);
            return String(int_value) === str;
        }

        Spice.add({
            id: "color_picker",
            name: "ColorPicker",
            data: data,
            meta: {},
            templates: templateObj,
            onShow: function() {
                $('#color_picker_container #saturation_value_picker').click(saturation_value_clicked);
                $('#color_picker_container #saturation_value_picker').on('dragstart', function(event) { event.preventDefault();});
                $('#color_picker_container #saturation_value_picker').mousedown(function(event) { saturation_value_mousedown = true; });
                $('#color_picker_container #saturation_value_picker').mousemove(function(event) { if (saturation_value_mousedown) saturation_value_clicked(event); });
                $('#color_picker_container #hue_picker').click(hue_clicked);
                $('#color_picker_container #hue_picker').on('dragstart', function(event) { event.preventDefault();});
                $('#color_picker_container #hue_picker').mousedown(function(event) { hue_mousedown = true; });
                $('#color_picker_container #hue_picker').mousemove(function(event) { if (hue_mousedown) hue_clicked(event); });
                $('#color_picker_container').mouseup(function(event) { saturation_value_mousedown = false; hue_mousedown = false; });
                $('#color_picker_container').focusout(function(event) { saturation_value_mousedown = false; hue_mousedown = false; });

                $('#color_picker_container #red_input').change(red_change);
                $('#color_picker_container #green_input').change(green_change);
                $('#color_picker_container #blue_input').change(blue_change);
                $('#color_picker_container #hue_input').change(hue_change);
                $('#color_picker_container #saturation_input').change(saturation_change);
                $('#color_picker_container #value_input').change(value_change);
                $('#color_picker_container #cyan_input').change(cyan_change);
                $('#color_picker_container #magenta_input').change(magenta_change);
                $('#color_picker_container #yellow_input').change(yellow_change);
                $('#color_picker_container #black_input').change(black_change);
                $('#color_picker_container #hex_input').change(hex_change);
                update_all();
            }
        });
    };
}(this));