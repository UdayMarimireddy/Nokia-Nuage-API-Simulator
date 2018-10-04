//package jmspub;

/**
 *
 * @author Uday Reddy
 */
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;
import java.util.Set;
import javax.jms.Connection;
import javax.jms.ConnectionFactory;
import javax.jms.JMSException;
import javax.jms.MessageProducer;
import javax.jms.Session;
import javax.jms.TextMessage;
import javax.jms.Topic;
import org.apache.activemq.ActiveMQConnectionFactory;

public class JMSPub implements Runnable
{
    private String topicName = "topic/CNAAlarms";
    private String message;
    private int messageCount = 1;
    private Connection connection;
    private Session session;
    private MessageProducer messageProducer;
    protected static String autonomousAlarms = "/home/ukumarreddy/NetBeansProjects/JMSPub/src/jmspub/autonomousAlarms.properties";
    Properties alarmList;
    
    JMSPub()
    {
        updateMessage();
    }
    
    public void create( String topicName, String msg ) throws JMSException
    {
        ConnectionFactory connectionFactory = new ActiveMQConnectionFactory( "tcp://localhost:61616" );

        // create a Connection
        connection = connectionFactory.createConnection();

        // create a Session
        session = connection.createSession( false, Session.AUTO_ACKNOWLEDGE );

        // create the Topic to which messages will be sent
        Topic topic = session.createTopic( topicName );

        // create a MessageProducer for sending messages
        messageProducer = session.createProducer( topic );
        this.sendMessage( msg );
    }

    public void sendMessage( String msg ) throws JMSException
    {
        // create a JMS TextMessage
        TextMessage textMessage = session.createTextMessage( msg );
        
        // send the message to the topic destination
        messageProducer.send( textMessage );
        
        System.out.println( "Alarm sent: " + textMessage );
    }

    /**
     * @param args the command line arguments
     */
    public static void main( String[] args )
    {
        ( new Thread( new JMSPub() ) ).start();
    }

    @Override
    public void run()
    {
        Set<String> keys = alarmList.stringPropertyNames();
        
        while ( true )
        {
            try
            {
                Thread.sleep( 5000 );
                
                if ( messageCount > alarmList.size() )
                    messageCount = 1;
                else
                    messageCount++;

                for ( String key: keys )
                {
                    if ( String.valueOf( messageCount ).equals( key ) )
                    {
                        message = alarmList.getProperty( key );
                    }
                }
                
                JMSPub jms = new JMSPub();
                jms.create( topicName, message );
            }
            catch ( InterruptedException ex )
            {
                ex.printStackTrace();
            }
            catch ( JMSException ex )
            {
                ex.printStackTrace();
            }
            catch ( Exception ex )
            {
                ex.printStackTrace();
            }
        }
    }

    private void updateMessage()
    {
        alarmList = loadProperties( autonomousAlarms );
    }

    private Properties loadProperties( String propFile )
    {
        Properties prop = new Properties();
        InputStream input = null;

        try
        {
            input = new FileInputStream( propFile );
            prop.load( input );
        }
        catch ( FileNotFoundException ex )
        {
            ex.printStackTrace();
        }
        catch ( IOException ex )
        {
            ex.printStackTrace();
        }
        
        finally
        {
            if ( input != null )
            {
                try
                {
                    input.close();
                }
                catch ( IOException ex )
                {
                    ex.printStackTrace();
                }
            }
        }
        
        return prop;
    }
}
