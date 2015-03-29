/**
 * Created by 衍晴 on 2015/3/26.
 * some assist functions
 */

function doMyCount(){
    var my_count = document.getElementById("my_count");
    var current_num = Number(my_count.innerHTML);
    current_num -= 2;
    my_count.innerHTML = current_num;
}
function doAdversaryCount() {
    var adversary_count = document.getElementById("adversary_count");
    var current_num = Number(adversary_count.innerHTML);
    current_num -= 2;
    adversary_count.innerHTML = current_num;
}