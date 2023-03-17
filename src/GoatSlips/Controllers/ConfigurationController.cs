using GoatSlips.Attributes;
using GoatSlips.DAL;
using Microsoft.AspNetCore.Mvc;

namespace GoatSlips.Controllers
{
    [Authorize]
    [ApiController]
    [Route("[controller]")]
    public class ConfigurationController : ControllerBase
    {
        private readonly IConfigurationRepository _configurationRepository;
        private readonly ILogger<ConfigurationController> _logger;

        public ConfigurationController(
            IConfigurationRepository configurationRepository,
            ILogger<ConfigurationController> logger
        )
        {
            _configurationRepository = configurationRepository;
            _logger = logger;
        }

        [HttpGet("GetMinutesPartition", Name = "GetMinutesPartition")]
        public ActionResult<byte> GetMinutesPartition()
        {
            try
            {
                byte minutesPartition = _configurationRepository.GetMinutesPartition();
                return Ok(minutesPartition);
            }
            catch (Exception e)
            {
                _logger.LogError(e.Message);
                return Problem(e.Message);
            }
        }

        [HttpGet("GetFirstDayOfWeek", Name = "GetFirstDayOfWeek")]
        public ActionResult<byte> GetFirstDayOfWeek()
        {
            try
            {
                byte firstDayOfWeek = _configurationRepository.GetFirstDayOfWeek();
                return Ok(firstDayOfWeek);
            }
            catch (Exception e)
            {
                _logger.LogError(e.Message);
                return Problem(e.Message);
            }
        }

        [HttpGet("SetMinutesPartition/{partition}", Name = "SetMinutesPartition")]
        public IActionResult SetMinutesPartition(byte partition)
        {
            try
            {
                _configurationRepository.SetMinutesPartition(partition);
                return Ok();
            }
            catch (Exception e)
            {
                _logger.LogError(e.Message);
                return Problem(e.Message);
            }
        }

        [HttpGet("SetFirstDayOfWeek/{firstDayOfWeek}", Name = "SetFirstDayOfWeek")]
        public IActionResult SetFirstDayOfWeek(byte firstDayOfWeek)
        {
            try
            {
                _configurationRepository.SetFirstDayOfWeek(firstDayOfWeek);
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
