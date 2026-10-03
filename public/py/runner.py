# Runs a student's checker.py inside Pyodide. Shared by the browser worker
# (worker.js) and the acceptance tests (scripts/test-python.mjs), so
# the tests exercise exactly what students run.
#
# Pyodide's own runPython() dedents source before compiling it, which would
# hide the IndentationError the curriculum teaches. So we compile() the code
# ourselves, untouched, under the filename the curriculum uses.

import builtins
import linecache
import sys
import traceback

FILENAME = "checker.py"
INPUT_MESSAGE = (
    "input() does not work here. "
    "Put the value in a variable at the top of your file instead."
)


class _InputNotAvailable(Exception):
    pass


def _no_input(*args, **kwargs):
    raise _InputNotAvailable()


def _student_frames_only(tb):
    # Drop everything before the first frame from the student's file (this
    # runner, Pyodide's plumbing). Frames after it are kept so a crash inside
    # a standard-library call still shows, exactly as real Python would.
    while tb is not None and tb.tb_frame.f_code.co_filename != FILENAME:
        tb = tb.tb_next
    return tb


def run_student_code(source):
    """Run source as checker.py. Returns the error text, or None on success."""
    namespace = {"__name__": "__main__", "__file__": FILENAME, "__builtins__": builtins}
    # Lets tracebacks quote the student's line, as real Python does for a file.
    linecache.cache[FILENAME] = (len(source), None, source.splitlines(True), FILENAME)
    real_input = builtins.input
    builtins.input = _no_input
    try:
        code = compile(source, FILENAME, "exec", dont_inherit=True)
        exec(code, namespace)
    except _InputNotAvailable:
        return INPUT_MESSAGE
    except SyntaxError as e:
        # A SyntaxError's location is in the exception, not the traceback.
        return "".join(traceback.format_exception(type(e), e, None))
    except BaseException as e:
        if isinstance(e, SystemExit) and e.code in (None, 0):
            return None
        tb = _student_frames_only(e.__traceback__)
        return "".join(traceback.format_exception(type(e), e, tb))
    finally:
        builtins.input = real_input
        sys.stdout.flush()
        sys.stderr.flush()
    return None
