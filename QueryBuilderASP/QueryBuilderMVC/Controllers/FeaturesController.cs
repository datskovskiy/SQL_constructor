using System.Web.Mvc;

namespace QueryBuilderMVC.Controllers
{
    public class FeaturesController : Controller
    {
        // GET: Features
        public ActionResult NoRegistration()
        {
            ViewBag.Message = "Query Builder can use without registration. For use just press 'START FREE'."+
                " Query Builder without registration have features such us:";

            return View();
        }

        public ActionResult ExportData()
        {
            ViewBag.Message = "Opportunity to export result for your query in *.XLS and *.PDF. Your data will be save to popular format files on your PC or send to e-mail.";
            return View();
        }

        public ActionResult SharedProject()
        {
            ViewBag.Message = "You have the ability to share your project with colleagues and build queries together or just give someone access requests in your project.";
            return View();
        }

        public ActionResult ER_Model()
        {
            ViewBag.Message = "You have the opportunity to see a detailed ER-model of your database." +
            " The ER-model will help you to trace all the connections and relationships of tables, as well as the available fields.";
            return View();
        }

        public ActionResult BuildQuery()
        {
            ViewBag.Message = "The ability to build your requests only with the mouse. You do not need to know the SQL to build your query and get results." +
            " For this will be enough to use our intuitive graphical interface.";
            return View();
        }
        public ActionResult TypesQuery()
        {
            ViewBag.Message = "The ability to build various types of queries, requests and combine to make nested queries.Complex queries are now easy to build.";
            return View();
        }
    }
}