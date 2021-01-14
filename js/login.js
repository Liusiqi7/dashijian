// 登录功能
// 找到表单 注册submit事件---阻止默认行为--收集表达数据(查询字符转格式)-Ajax请求
$('.login form').on('submit', function (e) {
    e.preventDefault();
    var data = $(this).serializeArray();
    // console.log(data);
    $.ajax({
        url:' http://www.itcbc.com:8080/api/login',
        data: data,
        type: 'POST',
        success: function (res) {
            // console.log(res);
            layer.msg(res.message);
            if (res.status === 0) { 
                // 登录成功后,马上把token保存到本地存储中
                localStorage.setItem('token', res.token);
                //跳转到category页面,因为现在就有两个页面,路径和使用js的html页面有关
                location.href = './category.html';
            }
        },
        error: function (xhr) { 
            // console.log(xhr);
            var res = xhr.responseJSON;
            if (res && res.status === 1) { 
                layer.msg(res.message);
            }
        }
    })
 })