"""
Logging configuration for CREAFT
"""

import logging
import sys
from loguru import logger
from app.core.config import get_settings

settings = get_settings()

def setup_logging():
    """Setup application logging"""
    
    # Remove default loguru handler
    logger.remove()
    
    # Configure loguru
    log_format = (
        "<green>{time:YYYY-MM-DD HH:mm:ss}</green> | "
        "<level>{level: <8}</level> | "
        "<cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> | "
        "<level>{message}</level>"
    )
    
    # Console handler
    logger.add(
        sys.stdout,
        format=log_format,
        level="DEBUG" if settings.ENVIRONMENT == "development" else "INFO",
        colorize=True
    )
    
    # File handler for errors
    logger.add(
        "logs/error.log",
        format=log_format,
        level="ERROR",
        rotation="1 day",
        retention="30 days",
        compression="zip"
    )
    
    # File handler for all logs
    logger.add(
        "logs/app.log",
        format=log_format,
        level="INFO",
        rotation="1 day", 
        retention="7 days",
        compression="zip"
    )
    
    # Intercept standard logging
    class InterceptHandler(logging.Handler):
        def emit(self, record):
            try:
                level = logger.level(record.levelname).name
            except ValueError:
                level = record.levelno
            
            frame, depth = logging.currentframe(), 2
            while frame.f_code.co_filename == logging.__file__:
                frame = frame.f_back
                depth += 1
            
            logger.opt(depth=depth, exception=record.exc_info).log(level, record.getMessage())
    
    # Replace standard logging handlers
    logging.basicConfig(handlers=[InterceptHandler()], level=0)
    
    # Set levels for noisy libraries
    logging.getLogger("uvicorn").setLevel(logging.WARNING)
    logging.getLogger("httpx").setLevel(logging.WARNING)
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)
    
    logger.info("Logging configured successfully")

def get_logger(name: str = None):
    """Get a logger instance"""
    if name:
        return logger.bind(name=name)
    return logger 