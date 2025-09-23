from jinja2 import Environment, FileSystemLoader
from pathlib import Path

class PromptTemplateService:
    def __init__(self, templates_dir: str | None = None):
        base = templates_dir or str(Path(__file__).resolve().parent.parent / "prompts")
        self.env = Environment(loader=FileSystemLoader(base), autoescape=False)
    
    def nutrition_prompt(self, *, strict_json: bool = True, default_serving_size : str | None = None):
        tp = self.env.get_template("prompt.md.j2")
        return tp.render(strict_json=strict_json, default_serving_size=default_serving_size)