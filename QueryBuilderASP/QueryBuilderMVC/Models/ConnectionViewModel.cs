using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Data.SqlClient;
using System.Timers;
using QueryBuilder.Utils.Extentions;
using QueryBuilder.Constants.DbConstants;

namespace QueryBuilderMVC.Models
{
	public class ConnectionViewModel
    {
        public IEnumerable<ConnectionsListViewModel> Connections { get; set; }

        [Required(ErrorMessage = @"Please enter connection name")]
		public string ConnectionName { get; set; }

		[Required(ErrorMessage = @"Please enter server name")]
		public string ServerName { get; set; }

		[Required(ErrorMessage = @"Please enter login")]
		public string LoginDB { get; set; }

		[Required(ErrorMessage = @"Please enter password")]
		[DataType(DataType.Password)]
		public string PasswordDB { get; set; }

		[Required(ErrorMessage = @"Please enter database name")]
		public string DatabaseName { get; set; }

		public int ConnectionOwner { get; set; }
		public int ConnectionID { get; set; }

        public int ConnectionCount { get; set; }

		public bool IsConnectionValid()
		{
			string connectionString = String.Format("Data source= {0}; Initial catalog= {1}; UID= {2}; Password= {3};",
			   ServerName, DatabaseName, LoginDB, PasswordDB);
			var connection = new SqlConnection(connectionString);
			try
			{
				connection.QuickOpen(SqlConnectionConstants.OpenTimeout);
				connection.Close();
				return true;
			}
			catch (Exception)
			{
				return false;
			}


		}

		private void Timer_Elapsed(object sender, ElapsedEventArgs e)
		{
			
			throw new NotImplementedException();
		}




	}


}