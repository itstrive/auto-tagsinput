/**
 *  @description [description]  含初始化数据
 *  @author [author]
 *  @version [version]
 */

/*
*  使用:
*  (function(){
		var dupArr=[];
		var initData=[{id:0,value:'value0'},{id:1,value:'value1'}];
		hyAutoComplete({
			input:'#hy-autocomplete-box .hy-input',
			url:'http://120.55.119.118:8088/oneseason-web-boss/demo/list.do',
			keyname:'kw', //给后台的搜索关键词的 key
			cbName:'callback',
			success:function(aaa){
				hyAutoComplete.renderDOM({
					renderBox:'#hy-autocomplete-box',
					data:aaa,
					fnClick:function(data){
						alert(JSON.stringify(data));

						//data.input.value='';
					},
					fnClose:function(data){
						alert(JSON.stringify(data));
					},
					fnDup:function(data){
						alert(data.id+',已经添加过了^_^');
					},
					dupArr:dupArr
				})
			}
		});
		hyAutoComplete.init(initData,dupArr,'#hy-autocomplete-box',function(data){
			alert(JSON.stringify(data));
		});
	})();
*
 */
;
(function() {
	function findInArray(n, arr) {
		for (var i = 0; i < arr.length; i++) {
			if (arr[i] == n) {
				return true;
			}
		}
		return false;
	}
	/**
	 * [get data from server by jsonp]
	 * @param  {[type]} json [description]
	 * @return {[viod]}      [description]
	 */
	function jsonp(json) {
		json = json || {};
		if (!json.url) return;
		json.data = json.data || {};
		json.cbName = json.cbName || 'cb';

		var fnName = 'jsonp_' + Math.random();
		fnName = fnName.replace('.', '');
		window[fnName] = function(data) {
			json.success && json.success(data);

			oHead.removeChild(oS);
		};

		json.data[json.cbName] = fnName;

		var arr = [];
		for (var name in json.data) {
			arr.push(name + '=' + json.data[name]);
		}


		var oS = document.createElement('script');
		//alert(JSON.stringify(json.data) == '{"' + json.cbName + '":"' + fnName + '"}')
		if (JSON.stringify(json.data) == '{"' + json.cbName + '":"' + fnName + '"}') {
			//alert(json.url + '&' + json.cbName + '=' + fnName)
			oS.src = json.url + '&' + json.cbName + '=' + fnName;
		} else {
			oS.src = json.url + '?' + arr.join('&');
		}
		var oHead = document.getElementsByTagName('head')[0];
		oHead.appendChild(oS);
	}

	window.hyAutoComplete = function(options) {
		if (!options.url) {
			throw new Error('arguments url must be');
		}

		var oInput = document.querySelector(options.input);

		var iNow = -1;

		var arrOl = []; //存储ol

		//console.log(options.url, options.data, options.cbName, options.success)
		oInput.oninput = function() {
			jsonp({
				url: options.url + '?' + options.keyname + '=' + oInput.value,
				cbName: options.cbName,
				success: function(dataJson) {
					//console.log(dataJson);
					//renderOlList(dataJson);
					//console.log(dataJson.s);
					options.success && options.success(dataJson);
				}
			})
		};

		function renderOlList(optionsData) {
			var {
				renderBox,
				data,
				fnClick,
				fnClose,
				dupArr,
				fnDup
			} = optionsData;
			//parentSelector, data, fnClick, fnClose, dupArr
			var oBox = document.querySelector(renderBox);
			var oUl = oBox.querySelector('.hy-item-list');
			var oInput = oBox.querySelector('.hy-input');
			var oOl = oBox.querySelector('.hy-show-list');

			arrOl.push(oOl);


			var arr = data;
			if (arr.length) {
				oOl.style.display = 'block';
			}
			oOl.innerHTML = '';

			for (var i = 0, len = arr.length; i < len; i++) {
				var oShowLi = document.createElement('li');
				oShowLi.classList.add('hy-show-item');
				oShowLi.innerHTML = arr[i].value;
				oShowLi.dataset['id'] = arr[i].id;
				oShowLi.dataset['value'] = arr[i].value;
				oOl.appendChild(oShowLi);

				//点击oShowLi

				oShowLi.onclick = function() {
					fnClick && fnClick({
						id: this.dataset.id,
						value: this.dataset.value
							//input: oInput
					});
					//alert(this.innerHTML);
					insert2ul({
						id: parseInt(this.dataset.id),
						value: this.dataset.value
					});
				};
			}

			var aLi = oOl.children;

			//鼠标移动aLi
			for (var i = 0; i < aLi.length; i++) {
				aLi[i].onmouseover = function() {
					for (var i = 0; i < aLi.length; i++) {
						aLi[i].classList.remove('active');
					}
					this.classList.add('active');
				};
			}

			function tabLi() {
				for (var i = 0; i < aLi.length; i++) {
					aLi[i].classList.remove('active');
				}
				if (iNow != -1) {
					aLi[iNow].classList.add('active');
				}
			}
			//键盘控制
			oInput.onkeydown = function(ev) {
				if (ev.keyCode == 40) {
					iNow++;
					if (iNow == aLi.length) {
						iNow = -1;
					}
					tabLi();
				}

				if (ev.keyCode == 38) {
					iNow--;
					if (iNow < -1) {
						iNow = aLi.length - 1;
					}
					tabLi();
					return false;
				}

				//回车
				if (ev.keyCode == 13) {
					if (!aLi[iNow]) {
						throw new Error('请选择数据');
						return;
					}
					fnClick && fnClick({
						id: aLi[iNow].dataset.id,
						value: aLi[iNow].dataset.value
					});
					insert2ul({
						id: parseInt(aLi[iNow].dataset.id),
						value: aLi[iNow].dataset.value
					});
				}
			};

			//添加到ul里面
			function insert2ul(dataV) {
				if (!dataV) {
					throw new Error('请选择数据');
					return;
				}

				//console.log(dataV.id, dupArr, findInArray(dataV.id, dupArr))
				if (findInArray(dataV.id, dupArr)) {
					fnDup && fnDup(dataV);
					return;
				}
				dupArr.push(dataV.id);


				var oLi = document.createElement('li');
				oLi.classList.add('hy-item');
				oLi.innerHTML = dataV.value + '<span class="hy-close-btn">×</span>';
				oLi.dataset['id'] = dataV.id;
				oLi.dataset['value'] = dataV.value;
				oUl.insertBefore(oLi, oUl.children[oUl.children.length - 1]);

				//关闭
				oLi.children[0].onclick = function() {
					fnClose && fnClose({
						id: this.parentNode.dataset.id,
						value: this.parentNode.dataset.value
					});
					oUl.removeChild(oLi);

					//从数组中也删除
					var n = dupArr.indexOf(parseInt(this.parentNode.dataset.id));
					if (n != -1) {
						dupArr.splice(n, 1);
					}
				};

				//收尾(隐藏ol，清空input)
				oOl.style.display = 'none';
				oInput.value = '';
				iNow = -1;
			}
		}


		function initInsert2ul(dataV, dupArr, oUl, fnClose) {

			var oLi = document.createElement('li');
			oLi.classList.add('hy-item');
			oLi.innerHTML = dataV.value + '<span class="hy-close-btn">×</span>';
			oLi.dataset['id'] = dataV.id;
			oLi.dataset['value'] = dataV.value;
			oUl.insertBefore(oLi, oUl.children[oUl.children.length - 1]);

			//关闭
			oLi.children[0].onclick = function() {
				fnClose && fnClose({
					id: this.parentNode.dataset.id,
					value: this.parentNode.dataset.value
				});
				oUl.removeChild(oLi);

				var n = dupArr.indexOf(parseInt(this.parentNode.dataset.id));
				//console.log(dupArr, this.parentNode.dataset.id, n);
				if (n != -1) {
					dupArr.splice(n, 1);
					console.log(dupArr);
				}
			};
		}
		//plugins
		//
		hyAutoComplete.renderDOM = renderOlList;
		hyAutoComplete.init = function(dataArr, dupArr, str, fnClose) {


			var oUl = document.querySelector(str + ' .hy-item-list');
			for (var i = 0; i < dataArr.length; i++) {
				dupArr.push(dataArr[i].id);

				initInsert2ul(dataArr[i], dupArr, oUl, fnClose);
			}
		};

		//点击页面消失弹出框
		document.addEventListener('click', function(ev) {
			for (var i = 0; i < arrOl.length; i++) {
				arrOl[i].style.display = 'none';
			}
		}, false);
	}
})()