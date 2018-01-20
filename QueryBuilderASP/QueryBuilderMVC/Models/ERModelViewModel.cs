using System.Data.SqlClient;
using QueryBuilder.Utils.DBSchema;

namespace QueryBuilderMVC.Models
{
	public class ERModelViewModel
	{

		public ERModelViewModel(SqlConnection conectionString)
		{
			ERModel = JsonERModel.GetERModel(conectionString);
		}

		public string ERModel
		{
			get; set;
		}
	}

}
