import { StepHandler } from '.';
/**
 * @inheritDoc login
 * @hasRunnableExample
 * @example
 *
 * <code>
 * {
 * 	    "step": "login",
 * 		"username": "admin",
 * 		"password": "password"
 * }
 * </code>
 */
export type LoginStep = {
    step: 'login';
    /**
     * The user to log in as. Defaults to 'admin'.
     */
    username?: string;
    /**
     * The password to log in with. Defaults to 'password'.
     */
    password?: string;
};
/**
 * Logs in to the Playground.
 * Under the hood, this function submits the wp-login.php form
 * just like a user would.
 */
export declare const login: StepHandler<LoginStep>;
