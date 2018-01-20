using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;


namespace QueryBuilderMVC.Models
{
    public class ProjectViewModel
    {
        public IEnumerable<ProjectsListViewModel> Projects { get; set; }

        public int IdCurrentProject { get; set; }
        [Required(ErrorMessageResourceType = typeof(Resources.Resource),
                 ErrorMessageResourceName = "ProjectValidationMessage")]
        [MaxLength(16, ErrorMessageResourceType = typeof(Resources.Resource),
                 ErrorMessageResourceName = "ProjectValidationMessageMaxLenght")]
        public string Name { get; set; }

        [Required(ErrorMessageResourceType = typeof(Resources.Resource),
                ErrorMessageResourceName = "ProjectValidationDescription")]
        [MaxLength(150, ErrorMessageResourceType = typeof(Resources.Resource),
                ErrorMessageResourceName = "ProjectValidationMessageDescriptionMaxLenght")]
        public string Description { get; set; }

        public IEnumerable<ConnectionsListViewModel> ConnectionDbs { get; set; }

		public IEnumerable<QueryListViewModel> Queries { get; set; }

		public IEnumerable<QueryHistoryListViewModel> QueryHistory { get; set; }

	}

}