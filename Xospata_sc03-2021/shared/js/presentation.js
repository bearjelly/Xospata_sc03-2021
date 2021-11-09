$(document).ready(function() {
    //menu
    let menu = '<div class="navi_wrap">';
    menu += '<div class="navi navi_std">';
    menu += ' <img src="../shared/images/navi/btn_std.png" alt="">';
    menu += '</div>';
    menu += '<div class="navi navi_ref">';
    menu += '  <img src="../shared/images/navi/btn_ref.png" alt="">';
    menu += '</div>';
    menu += '<div class="navi navi_pi">';
    menu += ' <img src="../shared/images/navi/btn_pi.png" alt="">';
    menu += '</div></div>';
    $('#container').append(menu);

    $('.navi_pi').on('click', function() {
        com.vclm.mt.gotoSlide('Xospata_sc03-2021_PI');
    })

    $(document).on('click', '.popup .close', function() {
        let $this = $(this).parents('.popup');
        $this.fadeOut(500, function() {
            $this.remove();
        })
    });

    $('.navi').on('click', function() {
        if ($(this).hasClass('navi_std')) {
            let popSTD = '<div class="popup pop_std">';
            popSTD += '<div class="close"></div>';
            popSTD += '<img src="../shared/images/bg_std.jpg" alt="">';
            popSTD += '<div class="pop_inner">';
            popSTD += '<img src="../shared/images/std_inner.png" alt="">';
            popSTD += '</div > ';
            popSTD += '<div class="num">AKR-XSP-202110-03';
            popSTD += '</div>';
            $('#container').append(popSTD)
            $('.pop_std').fadeIn();
        } else if ($(this).hasClass('navi_ref')) {
            let popREF = '<div class="popup pop_ref">';
            popREF += '<div class="close"></div>';
            popREF += '<img src="./images/ref.jpg" alt="">';
            popREF += '<div class="num">AKR-XSP-202110-03';
            popREF += '</div>';
            $('#container').append(popREF)
            $('.pop_ref').fadeIn();
        }
    })
});

class MobileMenu {
    constructor() {
        this.menuIcon = $(".icon-hamburger-menu");
        this.slideMenu = $(".navbar__slideMenu");
        this.events();
    }

    events() {
        this.menuIcon.click(this.toggleTheMenu.bind(this));
    }

    toggleTheMenu() {
        this.menuIcon.toggleClass("icon-hamburger-menu--close-x");
        this.slideMenu.toggleClass("slidemenu--expanded");
    }
}
new MobileMenu();