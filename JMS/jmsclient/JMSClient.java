//package jmsclient;

import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;
import java.util.Set;
import javax.annotation.Resource;
import javax.jms.Connection;
import javax.jms.ConnectionFactory;
import javax.jms.Destination;
import javax.jms.ExceptionListener;
import javax.jms.JMSException;
import javax.jms.Message;
import javax.jms.TextMessage;
import javax.jms.MessageConsumer;
import javax.jms.MessageListener;
import javax.jms.Session;
import javax.jms.Topic;
import javax.jms.TopicConnection;
import javax.jms.TopicConnectionFactory;
import javax.jms.TopicSession;
import javax.naming.Context;
import javax.naming.InitialContext;
import javax.naming.NamingException;

/**
 *
 * @author ukumarreddy
 */
public class JMSClient
        implements ExceptionListener, MessageListener {

    private static final String INITIAL_CONTEXT_FACTORY = "org.apache.activemq.jndi.ActiveMQInitialContextFactory";
    private static final String URL_PKG_PREFIXES = "org.jboss.naming:org.jnp.interfaces";
    private static String PROVIDER_URL;

    private int connectAttempts = 1;
    public static int reconnectWaitIntervalSecs = 15;
    public static int maxReconnectWaitIntervalSecs = 90;
    public static double reconnectDelayFactor = 2;

    private InitialContext jndiCtx = null;
    // Used to specify the target of messages it produces and the source of messages it consumes.
    @Resource(lookup = "jms/Topic")
    protected Destination topic = null;
    // Used to create connection to a provider.
    @Resource(lookup = "jms/ConnectionFactory")
    protected ConnectionFactory connectionFactory = null;
    protected Connection connection = null;
    protected Session session = null;
    protected MessageConsumer topicSubscriber = null;
    protected Properties configProperties = null;
    //Topic name
    protected String topicName = "jms/topic/CNAAlarms";
    //JNDI name
    protected String jmsRemoteFactory = "ConnectionFactory";
    // User and Password for creating the connection using the destination topic.
    protected String jmsUser;
    protected String jmsPassword;
    protected String messageSelector;
    protected static String propFile = "/home/ukumarreddy/NetBeansProjects/JMSClient/src/jmsclient/jmsclient.properties";
    protected static String nodeConf = "/home/ukumarreddy/NetBeansProjects/JMSClient/src/jmsclient/nodeName.properties";

    public JMSClient() {
        initializeVariables();
    }

    /**
     * @param args the command line arguments
     */
    public static void main(String[] args) {
        JMSClient jms = new JMSClient();
        jms.connect();
    }

    private static Properties getJndiConfig() {
        final Properties env = new Properties();
        env.put(Context.INITIAL_CONTEXT_FACTORY, INITIAL_CONTEXT_FACTORY);
        env.put(InitialContext.URL_PKG_PREFIXES, URL_PKG_PREFIXES);
        env.put(Context.PROVIDER_URL, PROVIDER_URL);

        return env;
    }

    private void connect() {
        Properties jndiProperties = getJndiConfig();

        try {
            jndiCtx = new InitialContext(jndiProperties);
            System.out.println("JNDI Initialized.");

            // Administrative tools allow you to bind destinations and connection factories into a JNDI namespace.
            topic = (Topic) jndiCtx.lookup(topicName);
            connectionFactory = (TopicConnectionFactory) jndiCtx.lookup(jmsRemoteFactory);
            //Connections implement the Connection interface. When you have a ConnectionFactory object, you can use it to create a Connection.
            connection = connectionFactory.createConnection(null,null);
            System.out.println("Connection established, " + connection+", user:"+jmsUser+", pass: "+jmsPassword+", Topic: "+topic);
            //The first argument means the session is not transacted; the second means the session automatically acknowledges messages when they have been received successfully.
            session = ((TopicConnection) connection).createSession(false, TopicSession.AUTO_ACKNOWLEDGE);
            topicSubscriber = ((TopicSession) session).createSubscriber((Topic) topic, messageSelector, true);

            /**
             * A message listener is an object that acts as an asynchronous
             * event handler for messages. This object implements the
             * MessageListener interface, which contains one method, onMessage.
             * In the onMessage method, you define the actions to be taken when
             * a message arrives.
             */
            topicSubscriber.setMessageListener(this);
            connection.start();
            System.out.println("Connected.\nListening..");
            connection.setExceptionListener(this);
        } catch (NamingException ex) {
            ex.printStackTrace();
            this.closeThings();
        } catch (JMSException ex) {
            System.out.println("Uday Exception JMS");
            ex.printStackTrace();
            this.closeThings();
        } catch (Exception ex) {
            ex.printStackTrace();
            this.closeThings();
        }

    }

    @Override
    public void onException(JMSException jmse) {
        jmse.printStackTrace();
    }

    private void initializeVariables() {
        configProperties = loadProperties(propFile);

        System.out.println("Configuration Properties: " + configProperties);

        topicName = configProperties.getProperty("topic");
        jmsUser = configProperties.getProperty("jms_username");
        jmsPassword = configProperties.getProperty("jms_password");
        messageSelector = configProperties.getProperty("message_selector");

        reconnectWaitIntervalSecs = Integer.parseInt(configProperties.getProperty("reconnect_wait_interval_secs",
                Integer.toString(reconnectWaitIntervalSecs)));
        maxReconnectWaitIntervalSecs = Integer.parseInt(configProperties.getProperty("max_reconnect_wait_interval_secs",
                Integer.toString(maxReconnectWaitIntervalSecs)));
        reconnectDelayFactor = Double.parseDouble(configProperties.getProperty("reconnect_delay_factor",
                Double.toString(reconnectDelayFactor)));
        connectAttempts = Integer.parseInt(configProperties.getProperty("connect_attempts",
                Integer.toString(connectAttempts)));

        if (connectAttempts <= 0) {
            connectAttempts = 1;  // minimum at least one.
        }
        configProperties = loadProperties(nodeConf);

        System.out.println("node Properties: " + configProperties);

        PROVIDER_URL = "tcp://" + configProperties.getProperty("ip") + ":" + configProperties.getProperty("port");

    }

    private Properties loadProperties(String propFile) {
        Properties prop = new Properties();
        InputStream input = null;

        try {
            input = new FileInputStream(propFile);
            prop.load(input);

        } catch (FileNotFoundException ex) {
            ex.printStackTrace();
        } catch (IOException ex) {
            ex.printStackTrace();
        } finally {
            if (input != null) {
                try {
                    input.close();
                } catch (IOException ex) {
                    ex.printStackTrace();
                }
            }
        }
        return prop;
    }

    @Override
    public void onMessage(final Message message) {
        try {
            TextMessage text = (TextMessage) message;
            String json = text.getText();
            System.out.println("Message: " + json);
        } catch (Exception ex) {
            ex.printStackTrace();
        }
    }

    public void closeThings() {
        {
            if (jndiCtx != null) {
                try {
                    System.out.println("JNDIclosed");
                    jndiCtx.close();
                } catch (NamingException ex) {
                    ex.printStackTrace();
                }
            }

            if (connection != null) {
                try {
                    System.out.println("Connectionclosed");
                    connection.close();
                } catch (JMSException ex) {
                    ex.printStackTrace();
                }
            }

            if (topicSubscriber != null) {
                try {
                    System.out.println("Consumerclosed");
                    topicSubscriber.close();
                } catch (JMSException ex) {
                    ex.printStackTrace();
                }
            }
        }
    }
}
