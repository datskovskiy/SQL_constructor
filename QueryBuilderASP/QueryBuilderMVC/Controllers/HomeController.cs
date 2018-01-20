using System.Web.Mvc;
using System.Web;
using System;
using System.Collections.Generic;
using QueryBuilderMVC.Filters;

namespace QueryBuilderMVC.Controllers
{
    [RequireHttps]
    [Culture]
    public class HomeController : Controller
    {
        public ActionResult Index()
        {
            //using (var context = new UniversityContext())
            //{
            //    var courses = context.Courses.ToList();
            //}

            return View();
        }

        public ActionResult About()
        {
            ViewBag.Message = "Your application description page.";

            return View();
        }

        public ActionResult Contact()
        {
            ViewBag.Message = "Your contact page.";

            return View();
        }
        public ActionResult WPF()
        {
            ViewBag.Message = "Your contact page.";

            return View();
        }
        public ActionResult ChangeCulture(string lang)
        {
            string returnUrl = Request.UrlReferrer.AbsolutePath;
            // Список культур
            List<string> cultures = new List<string>() { "ru", "en", "de" };
            if (!cultures.Contains(lang))
            {
                lang = "en";
            }
            // Сохраняем выбранную культуру в куки
            HttpCookie cookie = Request.Cookies["lang"];
            if (cookie != null)
                cookie.Value = lang;   // если куки уже установлено, то обновляем значение
            else
            {

                cookie = new HttpCookie("lang");
                cookie.HttpOnly = false;
                cookie.Value = lang;
                cookie.Expires = DateTime.Now.AddYears(1);
            }
            Response.Cookies.Add(cookie);
            return Redirect(returnUrl);
        }
    }
}