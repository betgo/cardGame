window.__my__ = {};
window.ll = window.__my__;

(function (__my__) {
    class MyTest {
        static Log() {
            console.log('hello LLFramework');
        }
        static Log2() {
            console.log('hello LLFramework');
        }
    }
    __my__.MyTest = MyTest;
})(__my__ || (__my__ = {}));
