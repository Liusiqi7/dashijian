// ------------------------封装一个token身份过期的函数,统一配置 headers、complete、url --------
// 只要涉及到my的接口地址, 都要设置请求头, 把token保存在本地存储里面,因为老师设置的是token身份两个小时就过期了,需要添加一个完成的函数,判断一下,如果说有xhr.responseJSON,并且状态值===1,并且.message === "身份认证失败！"就是说明token的身份已经过期,需要从本地存储里面移除掉过期的token,并跳转到登录页面
// 由于地址前面的根目录是重复的,所以需要把地址也封装一下,用了一个新知识ajaxPrefilter
// 定义一个根目录的变量
var baseurl = 'http://www.itcbc.com:8080';
$.ajaxPrefilter(function (option) { 
    // console.log(option.url);   /my/category/list
    // console.log(option.type);       GET
    // console.log(option.headers);     { Authorization: 'xxxxx' }
    // 统一配置url(加上根路径)
    option.url = baseurl + option.url;
    // 统一设置headers
    option.headers = {
        Authorization: localStorage.getItem('token')

    },
    option.complete= function(xhr) { 
        var res = xhr.responseJSON;
        if (res && res.status === 1 && res.message === '身份认证失败！') { 
            // 说明token过期了,并且移除点过期的token,跳转到登录界面
            localStorage.removeItem('token')
            location.href = './login.html';
        }
    }
})
// ------------------获取分类----
// 封装成函数,因为在后面的删除,添加,修改中都会用到,到时候直接调这个函数,更新页面中的数据
function renderCatrgory() { 
    $.ajax({
        url: '/my/category/list',
        success: function (res) {
            // console.log(res);
            if (res.status === 0) {
                var str = template('tpl-list', res);
                $('tbody').html(str);
            }
        }
    });
}
renderCatrgory();


// -----------------删除分类--------------------
// 因为是动态添加的,所以采用事件委托的方式,父元素tbody.给删除按钮定义一个类名del,并设置一个自定义属性,data-id,删除的时候用
$('tbody').on('click', '.del', function () { 
    // 获取自定义属性id
    var id = $(this).data('id');
    // 在删除的时候需要二次确认,confirm弹层,如果点击了取消不会有任何操作,如果点击了确定,就要发送ajax请求,接口地址url:
    layer.confirm('您确定要删除吗?', function(index){
        //do something
        $.ajax({
            url: '/my/category/delete',
            data: { id: id },
            success: function (res) {
                layer.msg=(res.message);
                if (res.status === 0) {
                    renderCatrgory();
                }
            }
        });
        // 关闭弹出层
        layer.close(index);
    });   
  
})
//------------------------ 添加分类
var addIndex;
// 1.点击添加类别,出现弹层
$('button:contains("添加类别")').on('click', function () { 
    addIndex = layer.open({
        type: 1,
        title: '添加类别',
        content: $('#tpl-add').html(),
        area: ['500px', '250px']
    });
})
// 2.表单提交,完成添加
$('body').on('submit', '#add-form', function (e) { 
    e.preventDefault();
    $.ajax({
        url:'/my/category/add',
        type: 'POST',
        // 表单里面的内容
        data:$(this).serialize(),
        success: function (res) {
            layer.msg = (res.message);
            if (res.status === 0) { 
                renderCatrgory();
                layer.close(addIndex);
            }
         }
    })
})

// -----------------修改编辑分类
// 因为点击编辑按钮的那一刻会弹出弹层,并且显示相对应的数据,和上面的步骤一样设置一个弹层
// 现在要完成点击编辑按钮弹出弹层,弹层是复制的上面的,里面的content内容采取模板引擎的方式,#tpl-del,现在已经设置好了模板引擎,
// 现在做数据回填,一共分为三个步骤:1.得给编辑按钮设置自定义属性,在接口文档中有三个必要的参数,id,name,alias,所以现在要去设置自定义属性,经过审查元素查看已经设置完自定义属性了
// 2.根据事件源得到自定义属性值3.设置输入框的默认值因为线上演示中, 弹出层是没有id的里面用到了隐藏域,
// 表单提交,完成编辑

var editIndex;
$('tbody').on('click', 'button:contains("编辑")', function () { 
    var shuju = $(this).data();
    // 输出打印一下,此时点击编辑按钮已经分别拿到了他们的自定义属性值
    console.log(shuju);
    editIndex = layer.open({
        type: 1,
        title: '编辑',
        // url:'/my/category/update',
        content:$('#tpl-edit').html(),
        area: ['500px', '250px'],
        // 弹出层里面也有success,弹层后调用下面的success,弹层后触发
        success: function () { 
            $('#edit-form input[name=name]').val(shuju.name);
            $('#edit-form input[name=alias]').val(shuju.alias);
            $('#edit-form input[name=id]').val(shuju.id);
        }
    })
    
})
// 因为这个表单也是动态添加的,所以也是事件委托
$('body').on('submit', '#edit-form', function (e) { 
    e.preventDefault();
    var data = $(this).serialize();
    $.ajax({
        url:'/my/category/update',
        data: data,
        type: 'POST',
        success: function (res) { 
            layer.msg = (res.message);
            if (res.status === 0) { 
                renderCatrgory();
                layer.close(editIndex);
                
            }
        }
    })
})