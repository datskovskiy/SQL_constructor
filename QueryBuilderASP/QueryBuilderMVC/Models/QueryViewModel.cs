using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace QueryBuilderMVC.Models
{
	public class QueryViewModel
	{
        public IEnumerable<QueryListViewModel> Queries { get; set; }

		[Required(ErrorMessage = @"Please enter query name")]
        [MaxLength(16, ErrorMessageResourceType = typeof(Resources.Resource),
                 ErrorMessageResourceName = "ProjectValidationMessageMaxLenght")]
        public string QueryName { get; set; }

		public int QueryID { get; set; }

        [MaxLength(150, ErrorMessageResourceType = typeof(Resources.Resource),
               ErrorMessageResourceName = "ProjectValidationMessageDescriptionMaxLenght")]
        public string Description { get; set; }

        public int UserID { get; set; }

		public int ProjectID { get; set; }

		[Required(ErrorMessage = @"Your query is empty")]
		public string QueryBody { get; set; }
	
		public DateTime QueryDate { get; set; }



	}


}