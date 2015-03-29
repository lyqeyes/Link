/**
 * Created by 衍晴 on 2015/3/21.
 */

// 游戏操作类:
var gameApp = new Game(socket);

// 每行图片数量
var rowImageNum = 10;
// 每列图片数量
var colImageNum = 10;
// 图片类型数量
var imageTypeNum = 20;

// 行数
var rowNum = rowImageNum + 2;
// 列数
var colNum = colImageNum + 2;

// 初始化一个二维矩阵，存放的是对应的图片类型
var matrix = new Array(colNum);
for(var j = 0; j < colNum; j++)
{
    matrix[j] = new Array(rowNum);
}

// 生成成对随机图片
// 要显示的图片数量(2个为1对)
var showImages = rowImageNum * colImageNum / 2;
// 生成的图片数组
var showImagesArray = new Array(showImages);
// 生成图片
for(var i = 0, n = 0, imgNum = 0; i < showImages; i++, n += 2, imgNum++)
{
    if(imgNum >= imageTypeNum)
    {
        imgNum = 0;
    }
    var img = imgNum + 1;
    showImagesArray[n] = img;
    showImagesArray[n+1] = img;
}
// 随机排序
showImagesArray = randomOrder(showImagesArray);

function printMap(imagesArray) {
    var html = createMap(imagesArray)
    document.getElementById("main").innerHTML = html;
}
function printViceMap(imagesArray){
    var html = createViceMap(imagesArray)
    document.getElementById("main_2").innerHTML = html;
}

function createMap(showImagesArray){
    // 将要输出的内容
    var html = "<p class='count'>You: <span id='my_count'>"+rowImageNum*colImageNum+"</span> left</p><table>\n";
// 行与列+2是因为上下左右的第一行都应为空
    var n = 0;
    for (var row = 0; row < colNum; row++) {
        html += "<tr>\n";
        for (var col = 0; col < rowNum; col++) {
            //html += "<td>\n" + row + ':' + col;
            html += "<td>\n";
            if (row == 0 || col == 0 || (colNum - 1) == row || (rowNum - 1) == col) {
                matrix[row][col] = 0;
            }
            else {
                matrix[row][col] = showImagesArray[n];
                n++;
            }
            if (matrix[row][col] > 0) {
                html += "<img src=\"images/" + matrix[row][col] + ".png\" onclick=\"checkPath(this, " + row + ", " + col + ")\">\n";
            }
            html += "</td>\n";
        }
    }
    return html;
}
//创建副地图
function createViceMap(showImagesArray){
    // 将要输出的内容
    var html = "<p class='count'>Adversary: <span id='adversary_count'>"+rowImageNum*colImageNum+"</span> left</p><table>\n";
// 行与列+2是因为上下左右的第一行都应为空
    var n = 0;
    for (var row = 0; row < colNum; row++) {
        html += "<tr>\n";
        for (var col = 0; col < rowNum; col++) {
            //html += "<td>\n" + row + ':' + col;
            html += "<td>\n";
            if (row == 0 || col == 0 || (colNum - 1) == row || (rowNum - 1) == col) {
                //temp_matrix[row][col] = 0;
            }
            else {
                html += "<img src=\"images/" + showImagesArray[n] + ".png\"  >\n";
                //temp_matrix[row][col] = showImagesArray[n];
                n++;
            }
            html += "</td>\n";
        }
    }
    return html;
}


/**
 * 检查路径
 *
 * @param object obj
 * @param integer x
 * @param integer y
 */
// 临时变量，保存图片对象
var tempO = null;
// 两对图片的路径信息
var pathInfo = new Array({x:0,y:0}, {x:0,y:0});
// 图片数量
var imageTotal = rowImageNum * colImageNum;
function checkPath(o, x, y)
{
    // 如果矩阵对应的位置存在图片
    if(matrix[x][y])
    {
        // 之前未选中图片
        if(tempO == null)
        {
            tempO = o;
            // 改变选中的图片单元格背景色
            tempO.parentNode.style.background = "#690";
            // 记录选中的图片位置
            pathInfo[0].x = x;
            pathInfo[0].y = y;
        }
        // 两次选中的不是同一张图片，进行比较
        else if(o != tempO)
        {
            // 清除背景颜色
            tempO.parentNode.style.background = "#fff";

            // 记录选中的图片位置
            pathInfo[1].x = x;
            pathInfo[1].y = y;

            // 如果两次选中的图片是相同类型
            if(matrix[pathInfo[0].x][pathInfo[0].y] == matrix[pathInfo[1].x][pathInfo[1].y])
            {
                // 判断两张图片是否可以消除
                if(feasiblePath(pathInfo[0], pathInfo[1]))
                {
                    //将消除坐标发送到服务器
                    gameApp.sendStep({pathInfo:pathInfo,room:$("#room").text()});
                    //计数
                    doMyCount();

                    // 将两张配对的图片位置标记为0
                    matrix[pathInfo[0].x][pathInfo[0].y] = 0;
                    matrix[pathInfo[1].x][pathInfo[1].y] = 0;
                    // 删除图片
                    tempO.parentNode.removeChild(tempO);
                    o.parentNode.removeChild(o);
                    tempO = null;
                    // 图片数量减2
                    imageTotal -= 2;
                    if(imageTotal <= 0)
                    {
                        alert("You Win!");
                        gameApp.gameOver($("#room").text());
                    }
                }
                else{
                    tempO = o;
                    tempO.parentNode.style.background = "#690";
                    // 记录选中的图片位置
                    pathInfo[0].x = x;
                    pathInfo[0].y = y;
                }
            }
            else{
                tempO = o;
                tempO.parentNode.style.background = "#690";
                // 记录选中的图片位置
                pathInfo[0].x = x;
                pathInfo[0].y = y;
            }
            //tempO = null;
        }
    }
    // 如果矩阵对应的位置不存在图片
    else
    {
        tempO = null;
    }
}

/**
 * 检查路径是否可行
 *
 * @param object A
 * @param object B
 *
 * @return boolean
 */

function feasiblePath(A,B)
{
    // 检查A点与B点时否是相邻，相邻直接可消除
    if(checkAdjacent(A, B))
    {
        return  true;
    }

    // 获取a与b的十字线
    var aPaths = getPaths(A);
    var bPaths = getPaths(B);

    // 从A点开始遍历
    for(var i = 0, n= aPaths.length; i < n; i++)
    {
        // 如果节点上存在图片，则跳过这次循环
        if(matrix[aPaths[i].x][aPaths[i].y])
        {
            continue;
        }

        // 检查A点到aPaths[i]点是否可行
        if(!checkTwoLine(aPaths[i], A))
        {
            continue;
        }

        // 获取与A点十字线与B点十字线相交的横向与纵向相交的位置
        var bPosition = getSamePosition(bPaths, aPaths[i]);

        for(var j = 0, jn = bPosition.length; j < jn; j++)
        {
            // 如果节点上存在图片，则跳过这次循环
            if(matrix[bPosition[j].x][bPosition[j].y])
            {
                continue;
            }

            // 检查bPosition点到B点是否可行
            if(!checkTwoLine(bPosition[j], B))
            {
                continue;
            }

            // 检查aPaths[i]点到bPosition点是否可行, 三条线都相通，表示可以消除
            if(checkTwoLine(aPaths[i], bPosition[j]))
            {
                return true;
            }
        }
    }
    return false;
}

// 获取某点的十字线
function getPaths(o)
{
    var paths = new Array();
    for(var i = 0; i < rowNum; i++)
    {
        paths.push({x:o.x, y:i});
    }

    for(var i = 0; i < colNum; i++)
    {
        paths.push({x:i, y:o.y});
    }
    return paths;
}

// 获取与A点与B点相交的X与Y坐标位置
function getSamePosition(targetPaths, o)
{
    var paths = new Array({x:0,y:0}, {x:0,y:0});
    for(var i = 0, n= targetPaths.length; i < n; i++)
    {
        // X轴相交的位置
        if(targetPaths[i].x == o.x)
        {
            paths[0] = {x:targetPaths[i].x, y:targetPaths[i].y};
        }

        // Y轴相交的位置
        if(targetPaths[i].y == o.y)
        {
            paths[1] = {x:targetPaths[i].x, y:targetPaths[i].y};
        }
    }

    return paths;
}

// 检查两点间的线是否可连
// A点必须为空
// B点可以不为空
function checkTwoLine(A, B)
{
    // 如果是同一行
    if(A.x == B.x)
    {
        for(var i = A.y; (A.y < B.y ? i < B.y : i > B.y); (A.y < B.y ? i ++ : i --))
        {
            if(matrix[A.x][i])
            {
                return false;
            }
        }
    }
    // 如果是同一列
    else
    {
        for(var i = A.x; (A.x < B.x ? i < B.x : i > B.x); (A.x < B.x ? i ++ : i --))
        {
            if(matrix[i][A.y])
            {
                return false;
            }
        }
    }

    return true;
}

// 检查两个点是否相邻
function checkAdjacent(A, B)
{
    var directions = new Array(-1, 1, 1, -1);

    var len = directions.length;
    for(var i = 0; i < len; i++)
    {
        if((A.x + directions[i]) == B.x && A.y == B.y)
        {
            return true;
        }

        if((A.y + directions[i]) == B.y && A.x == B.x)
        {
            return true;
        }
    }
    return false;
}

//随机改变数组的排序
function randomOrder(targetArray)
{
    var arrayLength = targetArray.length
    //先创建一个正常顺序的数组
    var tempArray1 = new Array();
    for (var i = 0; i < arrayLength; i ++)
    {
        tempArray1[i] = i;
    }

    //再根据上一个数组创建一个随机乱序的数组
    var tempArray2 = new Array();

    for (var i = 0; i < arrayLength; i ++)
    {
        //从正常顺序数组中随机抽出元素
        tempArray2[i] = tempArray1.splice(Math.floor(Math.random() * tempArray1.length) , 1)
    }

    //最后创建一个临时数组存储 根据上一个乱序的数组从targetArray中取得数据
    var tempArray3 = new Array();
    for (var i = 0; i < arrayLength; i ++)
    {
        tempArray3[i] = targetArray[tempArray2[i]];
    }

    //返回最后得出的数组
    return tempArray3;
}

var socket = io.connect();
var vice_images;
$(document).ready(function () {

    socket.on("step",function(step){
        var position_1 = (step[0].x-1)*rowImageNum + step[0].y;
        var position_2 = (step[1].x-1)*rowImageNum + step[1].y;
        vice_images[position_1-1].remove();
        vice_images[position_2-1].remove();
        doAdversaryCount();
    });

    socket.on("printMap",function(mapInfo){
        console.log(mapInfo);
        printViceMap(mapInfo);
        vice_images = $("#main_2 img");
    });

    socket.on("gameover",function(){
        alert("U lost the game.");
    });

});