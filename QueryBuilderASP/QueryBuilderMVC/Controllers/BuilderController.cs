using System;
using System.Collections.Generic;
using System.Web.Mvc;
using QueryBuilderMVC.Models;
using System.Data.SqlClient;
using QueryBuilder.Services.Contracts;
using QueryBuilder.Utils.Encryption;
using System.Configuration;

namespace QueryBuilderMVC.Controllers
{
    public class BuilderController : Controller
    {
        private readonly IConnectionDbService _serviceConnection;

        public BuilderController(IConnectionDbService serviceConnection)
        {
            _serviceConnection = serviceConnection;
        }


        // GET: Builder
        [HttpGet]
        public ActionResult ERModel(int id = 0)
        {
            if (id != 0)
            {
                string sqlConnection="";

                if (id == -1)
                {
                    //sqlConnection = System.Web.Configuration.WebConfigurationManager.OpenWebConfiguration("/MyWebSiteRoot").ConnectionStrings.ConnectionStrings["NorthwindConnection"].ConnectionString;
                    sqlConnection = ConfigurationManager.ConnectionStrings["TestConnection"].ConnectionString;
                    //sqlConnection = "Data Source =.\\v11; AttachDbFilename=| DataDirectory |NORTHWND.MDF; Integrated Security= True";
                }
                else
                {
                    var Connection = _serviceConnection.GetConnectionDb(id);

                    sqlConnection = String.Format("Data source= {0}; Initial catalog= {1}; UID= {2}; Password= {3};",
                   Connection.ServerName, Connection.DatabaseName, Connection.LoginDB, Rijndael.DecryptStringFromBytes(Connection.PasswordDB));
                }
                var sql = new SqlConnection(sqlConnection);

                var viewmodel = new ERModelViewModel(sql);
                return View(viewmodel);
            }
            else
            {
                return RedirectToAction("List", "Workflow");
            }
        }

        public JsonResult GetDBModel(string connectionString)
		{
			var movies = new List<object>();
			
			

			return Json(movies, JsonRequestBehavior.AllowGet);

		}
    }
}