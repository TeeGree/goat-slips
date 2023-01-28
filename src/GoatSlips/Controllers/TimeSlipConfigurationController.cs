using GoatSlips.Attributes;
using GoatSlips.DAL;
using Microsoft.AspNetCore.Mvc;

namespace GoatSlips.Controllers
{
    [Authorize]
    [ApiController]
    [Route("[controller]")]
    public class TimeSlipConfigurationController : ControllerBase
    {
        private readonly ITimeSlipConfigurationRepository _timeSlipConfigurationRepository;
        private readonly ILogger<TimeSlipConfigurationController> _logger;

        public TimeSlipConfigurationController(
            ITimeSlipConfigurationRepository timeSlipConfigurationRepository,
            ILogger<TimeSlipConfigurationController> logger
        )
        {
            _timeSlipConfigurationRepository = timeSlipConfigurationRepository;
            _logger = logger;
        }

        [HttpGet(Name = "GetMinutesPartition")]
        public ActionResult<byte> GetMinutesPartition()
        {
            try
            {
                byte minutesPartition = _timeSlipConfigurationRepository.GetMinutesPartition();
                return Ok(minutesPartition);
            }
            catch (Exception e)
            {
                _logger.LogError(e.Message);
                return Problem(e.Message);
            }
        }

        [HttpGet(Name = "SetMinutesPartition/{partition}")]
        public IActionResult SetMinutesPartition(byte partition)
        {
            try
            {
                _timeSlipConfigurationRepository.SetMinutesPartition(partition);
                return Ok();
            }
            catch (Exception e)
            {
                _logger.LogError(e.Message);
                return Problem(e.Message);
            }
        }
    }
}
