/**

*/

var SWNumSpinner = {
		
	init : function(cfg)
	{
		var me = this;
		
		var obj = new this.Ob(cfg || {});
        el.data('_object', obj);

        return obj;
		
	},
	getInstance: function(id)
    {
        var el = this.parseSelector(id);
        if (el.data('_object'))
        {
            return el.data('_object');
        }
        else
        {
            return this.init(id, cfg);
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
    }
};


SWNumSpinner.Ob = function(cfg)
{
	var me = this;
	this.cfg = cfg;
	
	//等默认
	$.extend(this,cfg);
	
	this.render();
	
	this.initEvent();
	
	$(function(){
		
	});

};

SWNumSpinner.Ob.prototype = {
		
	initEvent: function(){
			//点击+1事件
		    $(".gc_number_spinner .number_spinner_up").on('click',function(){
    	
	    	var e = $(this);    	
	    	var max = parseInt(e.attr("max"));    	
	    	var numShow = e.closest('.gc_number_spinner').find(".number_show");    	
	    	var val = parseInt(numShow.val()) + 1;
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
	    	
	    });
	    
	    //点击-1事件
	    $(".gc_number_spinner .number_spinner_down").on("click",function(){
	    	
	    	var e = $(this);    	
	    	var min = parseInt(e.attr("min"));    	
	    	var numShow = e.closest('.gc_number_spinner').find(".number_show");   	
	    	var val = parseInt(numShow.val()) - 1;
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
	    	
	    });
	    
	    //微调器输入框改变事件
	    $(".gc_number_spinner .number_show").on("change",function(){	    	
	    	var e = $(this);
	    	var val = parseInt(e.val(),10);
	    	var max = parseInt(e.parent().find(".number_spinner_up").attr("max"),10);
	    	var min = parseInt(e.parent().find(".number_spinner_down").attr("min"),10);
	    	
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
	    	
	    	gc_publiccloud_buy.countPrice();
	    });
	    
	    //控制微调输入框只能输入数字
	    $(".gc_number_spinner .number_show").keypress(function(event) {  
	        var keyCode = event.which;  
	        if (keyCode == 46 || (keyCode >= 48 && keyCode <=57) || keyCode == 8)//8是删除键  
	            return true;  
	        else  
	            return false;  
	    }).focus(function() {  
	        this.style.imeMode='disabled';  
	    }); 
	},
	render: function(){
		
		var me = this;
		
		var cfg = this.cfg;
		var el = $("<div class='gc_number_spinner'><div>");
		this.el = el;
		
		var bodyEl = $("body");
		var inputEl = $("<input class='number_show'>").attr('value',this.cfg.initVal||this.cfg.min||0).appendTo(el);
		var unitEl = $("<span class='number_spinner_unit'>"+this.cfg.unit+"</span>").appendTo(el);
		
		var controlEl = $("<div class='number_spinner_control'></div>").appendTo(el);
		
		var controlHtml = "<span class='number_spinner_up' max='"+this.cfg.max+"'>"
						+ "<i class='gc-number-arrow'></i></span>"			
						+ "<span class='number_spinner_down number_spinner_change_disable' min='"+this.cfg.min+"'>"		
						+ "<i class='gc-number-arrow'></i></span>";
		
		controlEl.append(controlHtml);
		
		if (this.container)
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
	    
	    this.el.appendTo(bodyEl);

	}
};



(function($){
	
    $.extend($.fn, {
        swnumspinner: function(cfg)
        {
        	SWNumSpinner.init(cfg);
        }
    });
}(jQuery));