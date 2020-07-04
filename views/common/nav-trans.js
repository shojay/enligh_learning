let listWrapper = document.getElementsByClassName('list-wrapper');
console.log(listWrapper);
scroll();
document.onscroll = debounce(function () {
    scroll();
}, 17);
function scroll() {
    let scrollTop = window.pageYOffset || document.body.scrollTop || document.documentElement.scrollTop;
    if (scrollTop > 80) {
        listWrapper[0].style.top = 0 + 'px';
    } else {
        listWrapper[0].style.top = 80 + 'px';
    }
}
function throttle(fn, delay, threshold) {
    let timer;
    let prevTime = Date.now();
    return function() {
        if (timer) {
            clearTimeout(timer);
        }
        let curTime = Date.now();
        if (curTime - prevTime >= threshold) {
            fn.apply(this,arguments);
            prevTime = curTime;
        } else {
            timer = setTimeout(function () {
                fn.apply(this, arguments);
            }, delay)
        }
    }
}
function debounce(fn, delay) {
    let timer;
    return function() {
        if (timer) clearTimeout(timer);
        timer = setTimeout(function () {
            fn.apply(this, arguments);
        }, delay)
    }
}
