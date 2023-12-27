using GoatSlips.DAL;
using GoatSlips.Models.Api.AzureDevOps;
using GoatSlips.Models.Database;
using GoatSlips.Services;
using Microsoft.AspNetCore.Mvc;

namespace GoatSlips.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public sealed class AzureDevOpsController : ControllerBase
    {
        private const string TimeTrackingProjectField = "Custom.TimeTrackingProject";
        private const string TimeTrackingTaskField = "Custom.TimeTrackingTask";
        private const string TimeTrackingLaborCodeField = "Custom.TimeTrackingLaborCode";
        private const string LastTimeSlipCreationField = "Custom.LastTimeSlipCreation";
        private const string LastTimeSlipDescriptionField = "Custom.LastTimeSlipDescription";

        private readonly ITaskRepository _taskRepository;
        private readonly ILaborCodeRepository _laborCodeRepository;
        private readonly IProjectRepository _projectRepository;
        private readonly ITimeSlipRepository _timeSlipRepository;

        public AzureDevOpsController(ITaskRepository taskRepository, ILaborCodeRepository laborCodeRepository, IProjectRepository projectRepository, ITimeSlipRepository timeSlipRepository)
        {
            _taskRepository = taskRepository;
            _laborCodeRepository = laborCodeRepository;
            _projectRepository = projectRepository;
            _timeSlipRepository = timeSlipRepository;
        }

        public bool Post([FromBody] AzureDevOpsEvent eventFromAdo)
        {
            Dictionary<string, object>? fields = eventFromAdo?.Resource?.Revision?.Fields;
            if (fields == null) {
                return false;
            }

            if (fields.ContainsKey(TimeTrackingProjectField) && fields.ContainsKey(TimeTrackingTaskField) && fields.ContainsKey(TimeTrackingLaborCodeField))
            {
                string project = fields[TimeTrackingProjectField].ToString() ?? "";
                string task = fields[TimeTrackingTaskField].ToString() ?? "";
                string laborCode = fields[TimeTrackingLaborCodeField].ToString() ?? "";
                string description = fields.TryGetValue(LastTimeSlipDescriptionField, out object? parsedDescription) ? (parsedDescription.ToString() ?? "") : "";
                string lastTimeSlipCreation = fields[LastTimeSlipCreationField].ToString() ?? "";

                int projectId = _projectRepository.Projects.First(x => x.Name == project).Id;
                int taskId = _taskRepository.Tasks.First(x => x.Name == task).Id;
                int laborCodeId = _laborCodeRepository.LaborCodes.First(x => x.Name == laborCode).Id;

                _timeSlipRepository.AddTimeSlips(new List<TimeSlip>
                {
                    new TimeSlip
                    {
                        ProjectId = projectId,
                        TaskId = taskId,
                        LaborCodeId = laborCodeId,
                        Description = description,
                        Date = DateTime.Parse(lastTimeSlipCreation)
                    }
                }, 1);
            }
            return true;
        }
    }
}
