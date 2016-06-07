/**

*/

var VWNumSpinner = {
		
	init : function(cfg)
	{
		var me = this;
		
		//根据id获取对象，如果对象存在就返回，反正初始化
		var el = this.parseSelector(cfg.id||'');
        if (!el || el.length < 1)
        {
            var obj = new this.Ob(cfg || {});
            obj.el.data("_object",obj);
        	return obj;
        }
        if (el.data('_object'))
        {
            debug('error, exists object', el, 'warn', el.data());
            return el.data('_object');
        }
		
	},
	getInstance: function(cfg)
    {

    	//根据id获取微调器对象，根据data判断是否已经初始化
        var el = this.parseSelector(cfg.id || cfg);
        if (el.data('_object'))
        {
            return el.data('_object');
        }
        else
        {
            return this.init(cfg);
        }
    },
    parseSelector: function(s)
    {
        if (typeof s == 'string')
        {
            if (/^[a-z_0-9-]+$/i.test(s))
            {
                return $('#' + s);
            }
            else
            {
                return $(s);
            }
        }
        else
        {
            return $(s);
        }
    },
    parsefn: function(fn)
    {
        var func = null;
        if (typeof fn == 'function')
        {
            func = fn;
        }
        else if (typeof fn == 'string')
        {
            if (fn.substr(0, 8) == 'function')
            {
                eval('func = ' + fn);
            }
            else if (/^[a-z0-9_-]+$/i.test(fn) && window[fn] && typeof window[fn] == 'function')
            {
                func = window[fn];
            }
            else
            {
                // if(fn.indexOf('return ') < 0) fn = 'return '+fn;
                if (fn.indexOf('.') > 0)
                {
                    var fns = fn.split('.');
                    func = window;
                    for (var i = 0, l = fns.length; i < l; i++)
                    {
                        var name = fns[i];
                        func = func[name];
                        if (!func)
                        {
                            break;
                        }
                    }
                    if (typeof func != 'function')
                    {
                        func = null;
                    }
                }
                if (!func || typeof func != 'function')
                {
                    func = new Function('success', 'res', fn);
                }
            }
        }
        else
        {
            return;
        }
        return func;
    },
    execfn: function(fn, element, params)
    {
        var func = this.parsefn(fn);

        if (func && typeof func == 'function')
        {
            return func.apply(element, params);
        }
        else
        {
            return;
        }
    },
    id: function()
    {
    	var id = null;
    	var prefix = "vw-numspinner-";
    	if (!VWNumSpinner.idNum) VWNumSpinner.idNum = 1;
        id = prefix + (VWNumSpinner.idNum++);
        return id;
    }
};


VWNumSpinner.Ob = function(cfg)
{
	var me = this;
	this.el = null;
	this.cfg = cfg || {};
	if(cfg.containerId)
	{
		this.container = VWNumSpinner.parseSelector(cfg.containerId);
	}	

	this.id = cfg.id || VWNumSpinner.id();
	if(cfg.step && !isNaN(cfg.step)){
		this.step = cfg.step;
	}else{
		this.step = 1;
	}
	
	//渲染页面
	this.render();
	
	//初始化事件
	this.initEvent();
	
	$(function(){
		me.initListeners();
	});

};

VWNumSpinner.Ob.prototype = {
		
	initEvent: function(){

		var me = this;
		//点击+事件
		$(".vw_number_spinner .number_spinner_up").on('mousedown',function(){
    	
	    	var e = $(this);  
	    	me.isSpin = true;  
	    	me.timer = setInterval(function(){
	    		me.spinnerUp(e);
	    	}, 100);	
	    		    	
	    });
	    
	    $(".vw_number_spinner .number_spinner_up").on('mouseup',function(){
   
	    	clearInterval(me.timer);
	    	me.isSpin = false;
	    	me.timer = 0;	
	    	var val = $(this).closest('.vw_number_spinner').find(".number_show").val();
	    	me.trigger('finish', [val, me]);
	    		    	
	    });

	    $(".vw_number_spinner .number_spinner_up").on('mouseout',function(){
   
   			if(me.isSpin){
		    	clearInterval(me.timer);
		    	me.isSpin = false;
		    	me.timer = 0;	
		    	var val = $(this).closest('.vw_number_spinner').find(".number_show").val();
		    	me.trigger('finish', [val, me]);
	    	}
	    		    	
	    });

	    //点击-事件
	    $(".vw_number_spinner .number_spinner_down").on("mousedown",function(){
	    	
	    	var e = $(this);  
	    	me.isSpin = true;  
	    	me.timer = setInterval(function(){
	    		me.spinnerDown(e);
	    	}, 100);
	    	
	    });

	    $(".vw_number_spinner .number_spinner_down").on("mouseup",function(){
	    	   
	    	clearInterval(me.timer);
	    	me.isSpin = false;
	    	me.timer = 0;	
	    	var val = $(this).closest('.vw_number_spinner').find(".number_show").val();
	    	me.trigger('finish', [val, me]);
	    	
	    });

	    $(".vw_number_spinner .number_spinner_down").on("mouseout",function(){
	    	   
	    	if(me.isSpin){
		    	clearInterval(me.timer);
		    	me.isSpin = false;
		    	me.timer = 0;	
		    	var val = $(this).closest('.vw_number_spinner').find(".number_show").val();
		    	me.trigger('finish', [val, me]);
	    	}
	    	
	    });
	    
	    //微调器输入框改变事件
	    $(".vw_number_spinner .number_show").on("change",function(){   	
	    	var e = $(this);
	    	var val = parseInt(e.val(),10);
	    	var max = parseInt(me.cfg.max,10);
	    	var min = parseInt(me.cfg.min,10);
	    	
	    	e.parent().find(".number_spinner_up").removeClass("number_spinner_change_disable");
	    	e.parent().find(".number_spinner_down").removeClass("number_spinner_change_disable");
	    	
	    	if(isNaN(val)){
	    		if(typeof(min) == "number"){
	    			val = min;
	    		}else{
	    			val = 1;
	    		}
	    	}
	    	
	    	if(typeof(min) == "number" && min >= val){
	    		e.parent().find(".number_spinner_down").addClass("number_spinner_change_disable");
	    		val = min;
	    	}
	    	
	    	if(typeof(max) == "number" && max <= val){
	    		e.parent().find(".number_spinner_up").addClass("number_spinner_change_disable");
	    		val = max;
	    	}
	    	
	    	e.val(val);
	    	if(me.isSpin){
	    		me.trigger('change', [val, me]);
	    	}else{
	    		me.trigger('finish', [val, me]);
	    	}
	    	
	    	
	    });
	    
	    //控制微调输入框只能输入数字
	    $(".vw_number_spinner .number_show").keypress(function(event) {  
	        var keyCode = event.which;  
	        if (keyCode == 46 || (keyCode >= 48 && keyCode <=57) || keyCode == 8)//8是删除键  
	            return true;  
	        else  
	            return false;  
	    }).focus(function() {  
	        this.style.imeMode='disabled';  
	    });

	    $(".vw_number_spinner").on("contextmenu",function(){

	    	return false;
	    }) ;
	},
	initListeners: function(){

		var me = this;
        var cfg = this.cfg;
        if (cfg && cfg.listeners)
        {
            for ( var k in cfg.listeners)
            {
                var fn = VWNumSpinner.parsefn(cfg.listeners[k]);
                if (fn)
                {
                    cfg.listeners[k] = fn;
                    this.on(k, fn);
                }
                else
                {
                    n = n || 0;
                    if (n < 3)
                    {
                        window.setTimeout(function()
                        {
                            me.initListeners(n + 1);
                        }, 200);
                        break;
                    }
                    else debug('error listener %s', k, 'warn', cfg.listeners[k]);
                }
            }
        }
        this._init_listenered = true;
	},
	render: function(){
		
		var me = this;
		
		var cfg = this.cfg;
		var el = $("<div class='vw_number_spinner'><div>").attr("id",me.id);

		this.el = el;
		
		var bodyEl = $("body");
		var inputEl = $("<input class='number_show'>").attr('value',cfg.initVal||cfg.min||0).attr("name",cfg.name).appendTo(el);
		var unitEl = $("<span class='number_spinner_unit'>"+cfg.unit+"</span>").appendTo(el);
		
		var controlEl = $("<div class='number_spinner_control'></div>").appendTo(el);
		
		var controlHtml = "<span class='number_spinner_up'>"
						+ "<i class='gc-number-arrow' onselectstart='return false;'></i></span>"			
						+ "<span class='number_spinner_down number_spinner_change_disable'>"		
						+ "<i class='gc-number-arrow'></i></span>";
		
		controlEl.append(controlHtml);
		
		if (this.container && this.container.length > 0)
	    {
	        this.container.append(this.el);
	    }
	    else
	    {
	        if (document.readyState && document.readyState == 'loading')
	        {
	            document.write('<div id="' + this.id + '_wrap"></div>');
	            this.el.appendTo('#' + this.id + '_wrap').unwrap();
	        }
	        else
	        {
	            this.el.appendTo(bodyEl);
	        }
	    }

	    return this;

	},
	spinnerUp: function(obj){
		var me = this;
		var e = obj;
		var max = parseInt(me.cfg.max);    	
    	var numShow = e.closest('.vw_number_spinner').find(".number_show");    	
    	var val = parseInt(numShow.val()) + this.step;
    	var down = e.parent().find(".number_spinner_down");
    	
    	if(e.hasClass("number_spinner_change_disable")){
    		return;
    	}
    	
    	if(typeof(max) == "number" && max <= val){
    		e.addClass("number_spinner_change_disable");
    		val = max;
    	}
    	
    	if(down && down.hasClass("number_spinner_change_disable")){
    		down.removeClass("number_spinner_change_disable");
    	}
    	
    	numShow.val(val).trigger("change");
    	me.trigger('spinup', [val, me]);
	},
	spinnerDown: function(obj){
		var me = this;
		var e = obj;    	
    	var min = parseInt(me.cfg.min);    	
    	var numShow = e.closest('.vw_number_spinner').find(".number_show");   	
    	var val = parseInt(numShow.val()) - this.step;
    	var up = e.parent().find(".number_spinner_up");
    	
    	if(e.hasClass("number_spinner_change_disable")){
    		return;
    	}
    	
    	if(typeof(min) == "number" && min >= val){
    		e.addClass("number_spinner_change_disable");
    		val = min;
    	}
    	
    	if(up && up.hasClass("number_spinner_change_disable")){
    		up.removeClass("number_spinner_change_disable");
    	}
    	
    	numShow.val(val).trigger("change");
    	me.trigger('spindown' , [val , me]);
	},
	on: function(ev, fn)
    {
        this.el.on('viw-' + ev, fn);
        return this;
    },
    trigger: function(ev, args)
    {
        this.el.trigger('viw-' + ev, args);
        return this;
    }
};



(function($){
	
    $.extend($.fn, {
        vwnumspinner: function(cfg)
        {
        	VWNumSpinner.getInstance(cfg);
        }
    });
}(jQuery));